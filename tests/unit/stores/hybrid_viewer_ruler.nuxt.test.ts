// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { nextTick } from "vue";

// Local imports
import { useHybridViewerHighlight } from "@ogw_internal/stores/hybrid_viewer/highlight";
import { useHybridViewerRuler } from "@ogw_internal/stores/hybrid_viewer/ruler";

describe("ruler hover highlight", () => {
  beforeEach(() => {
    const highlight = useHybridViewerHighlight();
    vi.spyOn(highlight, "clearHoverHighlight").mockReturnValue();
    highlight.is_hover_highlight.value = true;
    highlight.hover_highlight_field_type.value = "CELL";
  });

  test("leaves the user hover highlight untouched without snap", async () => {
    const { is_hover_highlight, hover_highlight_field_type } = useHybridViewerHighlight();
    const ruler = useHybridViewerRuler();

    ruler.is_ruler_active.value = true;
    await nextTick();

    expect(is_hover_highlight.value).toBe(true);
    expect(hover_highlight_field_type.value).toBe("CELL");
  });

  test("snaps on points, then restores the user hover highlight", async () => {
    const { is_hover_highlight, hover_highlight_field_type } = useHybridViewerHighlight();
    const ruler = useHybridViewerRuler();

    ruler.is_ruler_active.value = true;
    ruler.ruler_snap.value = true;
    await nextTick();
    expect(hover_highlight_field_type.value).toBe("POINT");

    ruler.deactivateRuler();
    await nextTick();
    expect(is_hover_highlight.value).toBe(true);
    expect(hover_highlight_field_type.value).toBe("CELL");
  });
});
