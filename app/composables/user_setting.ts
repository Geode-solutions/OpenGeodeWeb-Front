import type { Ref, ShallowRef } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { z } from "zod";

interface DesktopSettingsAPI {
  app_settings: unknown;
  app_settings_write: (settings: Record<string, unknown>) => Promise<unknown>;
}

// A setting of the user (theme, favorite CRS...), declared once next to the feature that uses it.
// Its value is replaced, never changed in place: `favorites.value = [...favorites.value, entry]`
interface UserSettingDefinition<Value> {
  // Its key in the desktop settings.json
  key: string;
  // Checks the stored value on read, strictly: an invalid one gives the fallback. A setting whose type
  // Changes takes a new key: the old value is left as is, never converted
  schema: z.ZodType<Value>;
  // A JSON value: copied for each use, compared when the setting is declared again
  fallback: Value;
  // Its key in the browser local storage
  browserKey: string;
  // The value shared by every caller on the desktop, with the settings API it is saved through
  desktop?: { api: DesktopSettingsAPI; setting: ShallowRef<Value> };
}

// The browser key and fallback of each declared setting, as JSON
const declared = new Map<string, string>();

// Declares a setting, at module level. Declaring it again the same way (hot reload, tests) is fine;
// Declaring it differently is an error: two features would overwrite each other's value.
function defineUserSetting<Value>(options: {
  key: string;
  schema: z.ZodType<Value>;
  fallback: Value;
  browserKey?: string;
}): UserSettingDefinition<Value> {
  const definition: UserSettingDefinition<Value> = {
    ...options,
    browserKey: options.browserKey ?? `ogw-${options.key}`,
  };
  const signature = JSON.stringify([definition.browserKey, definition.fallback]);
  const existing = declared.get(definition.key);
  if (existing !== undefined && existing !== signature) {
    throw new Error(`User setting "${definition.key}" is already defined differently`);
  }
  declared.set(definition.key, signature);
  return definition;
}

function hasDesktopSettingsAPI(
  value: typeof globalThis,
): value is typeof globalThis & { electronAPI: DesktopSettingsAPI } {
  return (
    "electronAPI" in value &&
    typeof value.electronAPI === "object" &&
    value.electronAPI !== null &&
    "app_settings" in value.electronAPI &&
    "app_settings_write" in value.electronAPI
  );
}

// The stored value when the setting's schema accepts it, a copy of the fallback otherwise
function validated<Value>(definition: UserSettingDefinition<Value>, value: unknown): Value {
  const result = definition.schema.safeParse(value);
  if (result.success) {
    return result.data;
  }
  return structuredClone(definition.fallback);
}

// Every value is stored as JSON. A value that is not JSON is a string stored raw by a previous version
// (the Vease color theme was stored as `dark`)
function parseStored(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function browserSetting<Value>(definition: UserSettingDefinition<Value>): Ref<Value> {
  return useLocalStorage<Value>(definition.browserKey, structuredClone(definition.fallback), {
    shallow: true,
    serializer: {
      read: (raw: string): Value => validated(definition, parseStored(raw)),
      write: (value: Value): string => JSON.stringify(value),
    },
  });
}

// A copy without Vue proxies: toRaw only unwraps the outer one, not the elements a filter or a spread returns
function toPlain(value: unknown): unknown {
  const raw: unknown = toRaw(value);
  if (Array.isArray(raw)) {
    return raw.map((item: unknown) => toPlain(item));
  }
  if (typeof raw === "object" && raw !== null) {
    return Object.fromEntries(
      Object.entries(raw).map(([entryKey, entryValue]) => [entryKey, toPlain(entryValue)]),
    );
  }
  return raw;
}

function desktopSetting<Value>(
  api: DesktopSettingsAPI,
  definition: UserSettingDefinition<Value>,
): Ref<Value> {
  if (definition.desktop?.api === api) {
    return definition.desktop.setting;
  }
  let saved: unknown = undefined;
  if (typeof api.app_settings === "object" && api.app_settings !== null) {
    saved = Reflect.get(api.app_settings, definition.key);
  }
  const setting = shallowRef(validated(definition, saved));
  // Detached: the first caller's unmount must not stop the saving
  effectScope(true).run(() => {
    watch(setting, (value) => {
      // Electron cannot send the Vue proxies a new value may hold, at any depth
      void api.app_settings_write({ [definition.key]: toPlain(value) });
    });
  });
  definition.desktop = { api, setting };
  return setting;
}

// The value of a setting, shared by every caller. The desktop app clears its browser storage on every launch:
// There the settings live in its settings.json, read before the page renders and written on every change.
// The browser keeps them in its local storage.
function useUserSetting<Value>(definition: UserSettingDefinition<Value>): Ref<Value> {
  const globalScope = globalThis;
  if (!hasDesktopSettingsAPI(globalScope)) {
    return browserSetting(definition);
  }
  return desktopSetting(globalScope.electronAPI, definition);
}

export type { UserSettingDefinition };
export { defineUserSetting, useUserSetting };
