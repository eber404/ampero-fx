export type ManualItem = {
  title: string;
  description: string;
};

export type ManualTableRow = Array<string | null | undefined>;

export type ManualTable = ManualTableRow[];
