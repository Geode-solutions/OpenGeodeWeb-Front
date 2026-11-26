import { type VueWrapper, flushPromises, mount } from "@vue/test-utils";
import CrsAlign from "@ogw_front/components/CrsAlign.vue";
import type { DataItem } from "@ogw_front/stores/data";
import { setDataItems } from "@ogw_tests/unit/stores/data_helpers";
import { useCrsStore } from "@ogw_front/stores/crs";
import { vuetify } from "@ogw_tests/utils";

const SOURCE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 0, y: 10 },
];
const TARGET = [
  { x: 1000, y: 2000 },
  { x: 1000, y: 2020 },
  { x: 980, y: 2000 },
];

const item: DataItem = {
  data_id: "item-1",
  geode_id: "00000000-0000-0000-0000-000000000001",
  name: "Points",
  geode_object_type: "PointSet3D",
  viewer_object_type: "mesh",
  visible: true,
  created_at: "",
};

async function fill(
  wrapper: VueWrapper,
  testId: string,
  point: { x: number; y: number },
): Promise<void> {
  const [xInput, yInput] = wrapper.find(`[data-testid="${testId}"]`).findAll("input");
  await xInput?.setValue(String(point.x));
  await yInput?.setValue(String(point.y));
}

// Wells share the local frame of the model; the map is already in another CRS.
// The crs store reads the data when it is created: the data are mocked before the align opens
function mountWithWells(lambert: DataItem["crs"]): {
  wrapper: VueWrapper;
  wells: DataItem;
} {
  const stored: DataItem = { ...item, created_at: "2026-10-27" };
  const wells: DataItem = { ...stored, data_id: "item-2", name: "Wells" };
  const georeferenced: DataItem = { ...stored, data_id: "item-3", name: "Map", crs: lambert };
  setDataItems([stored, wells, georeferenced]);
  useCrsStore().openCrsAlign(item);
  return { wrapper: mount(CrsAlign, { global: { plugins: [vuetify] } }), wells };
}

async function fillPoints(wrapper: VueWrapper): Promise<void> {
  await Promise.all(
    SOURCE.map(async (point, index) => {
      await fill(wrapper, `crsAlignSource-${index}`, point);
    }),
  );
  await Promise.all(
    TARGET.map(async (point, index) => {
      await fill(wrapper, `crsAlignTarget-${index}`, point);
    }),
  );
}

async function applyPoints(wrapper: VueWrapper): Promise<void> {
  await fillPoints(wrapper);
  await wrapper.find('[data-testid="crsSelectorStub"]').trigger("click");
  await flushPromises();
  await wrapper.find('[data-testid="crsAlignApplyButton"]').trigger("click");
  await flushPromises();
}

export { SOURCE, TARGET, applyPoints, fill, fillPoints, item, mountWithWells };
