import type {
  AttributeInput,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";

function isAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

export { isAttributeValid };
