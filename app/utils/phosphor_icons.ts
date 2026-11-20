// Third party imports
import type { IconAliases, IconOptions, IconProps, IconSet } from "vuetify";
import { type VNode, h } from "vue";

// Icons of the apps: Phosphor (https://phosphoricons.com), the flat line icons of the Geode Solutions
// Brand book. An icon is written "ph-<name>" for the regular weight or "ph-fill ph-<name>" for the
// Fill one, optionally followed by other classes. The font CSS is registered in nuxt.config `css`.
const PHOSPHOR_SET_NAME = "ph";
const REGULAR_WEIGHT = "ph";
const FILL_WEIGHT = "ph-fill";

// Classes of the rendered tag: the weight class, then the icon classes as written
function phosphorIconClass(icon: string): string {
  const classes = icon.trim().split(/\s+/u);
  if (classes[0] !== FILL_WEIGHT) {
    classes.unshift(REGULAR_WEIGHT);
  }
  return classes.join(" ");
}

// Same shape as Vuetify's VClassIcon: the v-icon classes, styles and attributes fall through to the
// Rendered tag, so sizes and colors behave as with any font icon set
function PhosphorIcon(props: IconProps): VNode {
  return h(props.tag, { class: phosphorIconClass(String(props.icon ?? "")) });
}
PhosphorIcon.props = ["icon", "tag"];

const phosphor: IconSet = { component: PhosphorIcon };

// Icons Vuetify components draw by themselves ($close, $checkboxOn, $expand...)
const PHOSPHOR_ALIASES: IconAliases = {
  collapse: "ph-caret-up",
  complete: "ph-check",
  cancel: "ph-x-circle",
  close: "ph-x",
  delete: "ph-x-circle",
  clear: "ph-x-circle",
  success: "ph-check-circle",
  info: "ph-info",
  warning: "ph-warning-circle",
  error: "ph-x-circle",
  prev: "ph-caret-left",
  next: "ph-caret-right",
  checkboxOn: "ph-check-square",
  checkboxOff: "ph-square",
  checkboxIndeterminate: "ph-minus-square",
  delimiter: "ph-fill ph-circle",
  sortAsc: "ph-arrow-up",
  sortDesc: "ph-arrow-down",
  expand: "ph-caret-down",
  menu: "ph-list",
  subgroup: "ph-caret-down",
  dropdown: "ph-caret-down",
  radioOn: "ph-radio-button",
  radioOff: "ph-circle",
  edit: "ph-pencil-simple",
  ratingEmpty: "ph-star",
  ratingFull: "ph-fill ph-star",
  ratingHalf: "ph-fill ph-star-half",
  loading: "ph-arrows-clockwise",
  first: "ph-caret-line-left",
  last: "ph-caret-line-right",
  unfold: "ph-caret-up-down",
  file: "ph-paperclip",
  plus: "ph-plus",
  minus: "ph-minus",
  calendar: "ph-calendar-blank",
  treeviewCollapse: "ph-caret-down",
  treeviewExpand: "ph-caret-right",
  tableGroupCollapse: "ph-caret-down",
  tableGroupExpand: "ph-caret-right",
  eyeDropper: "ph-eyedropper",
  upload: "ph-cloud-arrow-up",
  color: "ph-palette",
  command: "ph-command",
  ctrl: "ph-control",
  space: "ph-keyboard",
  shift: "ph-arrow-fat-up",
  alt: "ph-option",
  enter: "ph-key-return",
  arrowup: "ph-arrow-up",
  arrowdown: "ph-arrow-down",
  arrowleft: "ph-arrow-left",
  arrowright: "ph-arrow-right",
  backspace: "ph-backspace",
  play: "ph-play",
  pause: "ph-pause",
  fullscreen: "ph-corners-out",
  fullscreenExit: "ph-corners-in",
  volumeHigh: "ph-speaker-high",
  volumeMedium: "ph-speaker-low",
  volumeLow: "ph-speaker-none",
  volumeOff: "ph-speaker-x",
  search: "ph-magnifying-glass",
};

function phosphorIconOptions(): IconOptions {
  return {
    defaultSet: PHOSPHOR_SET_NAME,
    aliases: PHOSPHOR_ALIASES,
    sets: { [PHOSPHOR_SET_NAME]: phosphor },
  };
}

export { PHOSPHOR_ALIASES, PHOSPHOR_SET_NAME, phosphor, phosphorIconClass, phosphorIconOptions };
