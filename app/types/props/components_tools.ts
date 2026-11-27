import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { Title } from "@ogw_front/types/ui";

// An entry of a dataset select: the name displayed and the data it selects
interface DatasetOption {
  title: Title;
  value: DataId;
}

export type { DatasetOption };
