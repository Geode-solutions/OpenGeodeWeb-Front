// Brand colors drawn by the front itself (orientation markers, camera orientation panel). Components bind
// Them in their styles with v-bind() so the value lives here only.

// Geode Solutions orange: the north of the compasses and of the axes globe
const BRAND_ORANGE = "#F48830";
// The north border of the round targets: the orange, a bit transparent
const BRAND_ORANGE_BORDER = `color-mix(in srgb, ${BRAND_ORANGE} 60%, transparent)`;

export { BRAND_ORANGE, BRAND_ORANGE_BORDER };
