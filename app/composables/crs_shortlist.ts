import type { ComputedRef, Ref } from "vue";
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { CrsEntry } from "@ogw_front/utils/crs";
import { useCrsStore } from "@ogw_front/stores/crs";

const HISTORY_SIZE = 5;

interface CrsShortlistApi {
  favorites: Ref<CrsEntry[]>;
  recent: ComputedRef<CrsEntry[]>;
  toggleFavorite: (crs: CRS) => void;
  recordUse: (crs: CRS) => void;
}

// Codes are only unique within an authority (e.g. EPSG:4812 and ESRI:4812)
function crsKey({ authority, code }: CrsEntry): string {
  return `${authority}:${code}`;
}

// Only what the CRS selector shows: the back may add other fields
function toEntry({ authority, code, name }: CRS): CrsEntry {
  return { authority, code, name };
}

// The favorite CRS and the last ones used, kept across launches for the CRS selectors.
// Stored where the crs store says: the browser by default, or the storage given by the app
function useCrsShortlist(): CrsShortlistApi {
  const crsStore = useCrsStore();
  const { favorites, history } = crsStore.crsShortlistStorage;

  // The whole history, favorites included: the selector shows the two lists in their own row
  const recent = computed(() => history.value);

  function toggleFavorite(crs: CRS): void {
    const key = crsKey(crs);
    if (favorites.value.some((entry) => crsKey(entry) === key)) {
      favorites.value = favorites.value.filter((entry) => crsKey(entry) !== key);
      return;
    }
    favorites.value = [...favorites.value, toEntry(crs)];
  }

  function recordUse(crs: CRS): void {
    const key = crsKey(crs);
    const others = history.value.filter((entry) => crsKey(entry) !== key);
    history.value = [toEntry(crs), ...others].slice(0, HISTORY_SIZE);
  }

  return { favorites, recent, toggleFavorite, recordUse };
}

export { useCrsShortlist };
