import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import {
  defineUserSetting,
  useUserSetting,
} from "@ogw_front/composables/user_setting";
import { nextTick } from "vue";
import { z } from "zod";

vi.setConfig({ testTimeout: 10_000 });

const LAMBERT = {
  authority: "EPSG",
  code: "2154",
  name: "RGF93 v1 / Lambert-93",
};
const UTM = { authority: "EPSG", code: "32631", name: "WGS 84 / UTM zone 31N" };

const crsListSchema = z.array(
  z.object({ authority: z.string(), code: z.string(), name: z.string() }),
);
const listSetting = defineUserSetting({
  key: "testList",
  schema: crsListSchema,
  fallback: [],
});
const themeSetting = defineUserSetting({
  key: "testTheme",
  schema: z.enum(["light", "dark"]),
  fallback: "light",
  browserKey: "test-theme",
});

type WriteSettings = (settings: Record<string, unknown>) => Promise<unknown>;

function mockDesktop(
  appSettings: Record<string, unknown>,
  write?: WriteSettings,
): Mock<WriteSettings> {
  const writeSettings = vi.fn<WriteSettings>(write);
  Object.assign(globalThis, {
    electronAPI: {
      app_settings: appSettings,
      app_settings_write: writeSettings,
    },
  });
  return writeSettings;
}

describe("user setting", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("reads and writes a list in the local storage", async () => {
    const setting = useUserSetting(listSetting);

    setting.value.push(LAMBERT);
    await nextTick();
    expect(localStorage.getItem("ogw-testList")).toBe(
      JSON.stringify([LAMBERT]),
    );
  });

  test("stores a string raw", async () => {
    localStorage.setItem("test-theme", "dark");
    const setting = useUserSetting(themeSetting);
    expect(setting.value).toBe("dark");

    setting.value = "light";
    await nextTick();
    expect(localStorage.getItem("test-theme")).toBe("light");
  });

  test("falls back on an invalid stored value", () => {
    localStorage.setItem("ogw-testList", "{not json");
    expect(useUserSetting(listSetting).value).toStrictEqual([]);
    localStorage.setItem("ogw-testList", '[{"code":1}]');
    expect(useUserSetting(listSetting).value).toStrictEqual([]);
  });

  test("shares one value between callers", async () => {
    const first = useUserSetting(listSetting);
    const second = useUserSetting(listSetting);

    first.value = [LAMBERT];
    await nextTick();
    expect(second.value).toStrictEqual([LAMBERT]);
  });

  test("accepts the same definition twice", () => {
    const options = { key: "dup", schema: z.array(z.string()), fallback: [] };
    expect(defineUserSetting(options)).toBe(defineUserSetting({ ...options }));
  });

  test("refuses another definition of a key", () => {
    defineUserSetting({
      key: "taken",
      schema: z.array(z.string()),
      fallback: [],
    });
    expect(() =>
      defineUserSetting({
        key: "taken",
        schema: z.array(z.string()),
        fallback: ["a"],
      }),
    ).toThrow("taken");
    expect(() =>
      defineUserSetting({
        key: "taken",
        schema: z.array(z.string()),
        fallback: [],
        browserKey: "other",
      }),
    ).toThrow("taken");
  });
});

describe("user setting on desktop", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "electronAPI");
  });

  test("reads and writes the desktop settings", async () => {
    const writeSettings = mockDesktop({ testList: [LAMBERT] });
    const setting = useUserSetting(listSetting);

    expect(setting.value).toStrictEqual([LAMBERT]);
    setting.value.push(UTM);
    await nextTick();
    expect(writeSettings).toHaveBeenCalledWith({ testList: [LAMBERT, UTM] });
    expect(localStorage.getItem("ogw-testList")).toBeNull();
  });

  test("sends a value the desktop messages can copy", async () => {
    const sent: unknown[] = [];
    // Electron copies every message with the structured clone algorithm, which refuses Vue proxies
    mockDesktop({ testList: [LAMBERT] }, async (settings) => {
      sent.push(structuredClone(settings));
      await Promise.resolve();
    });
    const setting = useUserSetting(listSetting);

    setting.value.push(UTM);
    await nextTick();
    expect(sent).toStrictEqual([{ testList: [LAMBERT, UTM] }]);
  });

  test("shares one value between callers", () => {
    mockDesktop({});
    expect(useUserSetting(listSetting)).toBe(useUserSetting(listSetting));
  });

  test("falls back on an invalid desktop value", () => {
    mockDesktop({ testTheme: "solarized" });
    expect(useUserSetting(themeSetting).value).toBe("light");
  });
});
