import type { Ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { z } from "zod";

// A setting of the user (theme, favorite CRS...), declared once next to the feature that uses it
interface UserSettingDefinition<Value> {
  // Its key in the desktop settings.json
  key: string;
  // Checks the stored value on read: an invalid one gives the fallback
  schema: z.ZodType<Value>;
  fallback: Value;
  // Its key in the browser local storage
  browserKey: string;
}

interface DesktopSettingsAPI {
  app_settings: unknown;
  app_settings_write: (settings: Record<string, unknown>) => Promise<unknown>;
}

const definitions = new Map<string, UserSettingDefinition<unknown>>();
// One ref per setting shared by every caller, as the local storage refs are kept in sync in the browser
const desktopSettings = new WeakMap<DesktopSettingsAPI, Map<string, Ref<unknown>>>();

// Declares a setting, at module level. Declaring it again the same way (hot reload, tests) keeps the first
// Declaration; declaring it differently is an error: two features would overwrite each other's value.
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
  const existing = definitions.get(definition.key);
  if (existing === undefined) {
    definitions.set(definition.key, definition);
    return definition;
  }
  if (
    existing.browserKey !== definition.browserKey ||
    JSON.stringify(existing.fallback) !== JSON.stringify(definition.fallback)
  ) {
    throw new Error(`User setting "${definition.key}" is already defined differently`);
  }
  // oxlint-disable-next-line no-unsafe-type-assertion -- same key, browser key and fallback: same setting
  return existing as UserSettingDefinition<Value>;
}

function hasDesktopSettingsAPI(
  value: typeof globalThis,
): value is typeof globalThis & { electronAPI: DesktopSettingsAPI } {
  return (
    "electronAPI" in value &&
    typeof value.electronAPI === "object" &&
    value.electronAPI !== null &&
    "app_settings_write" in value.electronAPI
  );
}

// A copy of the fallback: a list setting changed in place must not change its fallback
function freshFallback<Value>(definition: UserSettingDefinition<Value>): Value {
  return structuredClone(definition.fallback);
}

// The stored value when the setting's schema accepts it, the fallback otherwise
function validated<Value>(definition: UserSettingDefinition<Value>, value: unknown): Value {
  const result = definition.schema.safeParse(value);
  if (result.success) {
    return result.data;
  }
  return freshFallback(definition);
}

// Strings stay raw (the Vease color theme is stored as `dark`), the other values are JSON
function parseStored(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function browserSetting<Value>(definition: UserSettingDefinition<Value>): Ref<Value> {
  return useLocalStorage<Value>(definition.browserKey, freshFallback(definition), {
    serializer: {
      read: (raw: string): Value => validated(definition, parseStored(raw)),
      write: (value: Value): string => {
        if (typeof value === "string") {
          return value;
        }
        return JSON.stringify(value);
      },
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
  let settings = desktopSettings.get(api);
  if (!settings) {
    settings = new Map();
    desktopSettings.set(api, settings);
  }
  const shared = settings.get(definition.key);
  if (shared) {
    // oxlint-disable-next-line no-unsafe-type-assertion -- the map holds the ref created below for this key
    return shared as Ref<Value>;
  }
  let saved: unknown = undefined;
  if (typeof api.app_settings === "object" && api.app_settings !== null) {
    saved = Reflect.get(api.app_settings, definition.key);
  }
  // oxlint-disable-next-line no-unsafe-type-assertion -- ref() unwraps the value type, which a generic setting cannot express
  const setting = ref(validated(definition, saved)) as Ref<Value>;
  // Detached: the first caller's unmount must not stop the saving
  effectScope(true).run(() => {
    watch(
      setting,
      (value) => {
        // Electron cannot send Vue proxies, which a nested value may hold at any depth
        void api.app_settings_write({ [definition.key]: toPlain(value) });
      },
      { deep: true },
    );
  });
  settings.set(definition.key, setting);
  return setting;
}

// The value of a setting, shared by every caller. The desktop app clears its browser storage on every launch:
// There the settings live in its settings.json, read before the page renders and written on every change, nested
// Ones included. The browser keeps them in its local storage.
function useUserSetting<Value>(definition: UserSettingDefinition<Value>): Ref<Value> {
  const globalScope = globalThis;
  if (!hasDesktopSettingsAPI(globalScope)) {
    return browserSetting(definition);
  }
  return desktopSetting(globalScope.electronAPI, definition);
}

export type { UserSettingDefinition };
export { defineUserSetting, useUserSetting };
