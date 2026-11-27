import type { Title } from "@ogw_front/types/ui";

// A column of a csv file, by the key the preview gives it
type CsvColumnKey = string;

// The position of a line in a csv file
type CsvRowIndex = number;

// The character that separates the values of a line of a csv file
type CsvSeparator = string;

// A column of the csv preview table
interface CsvHeader {
  title: Title;
  key: CsvColumnKey;
  align: "start" | "end" | "center";
  sortable: boolean;
}

// A row of a csv file, its values by column key
type CsvRow = Record<CsvColumnKey, string>;

export type { CsvColumnKey, CsvHeader, CsvRow, CsvRowIndex, CsvSeparator };
