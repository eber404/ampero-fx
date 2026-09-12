export type ManualItem = {
  title: string;
  description: string;
  category?: ManualCategory;
  subtype?: string;
};

export type ManualCategory =
  | 'amps'
  | 'cabs'
  | 'mics'
  | 'ir'
  | 'drives'
  | 'dynamics'
  | 'modulation'
  | 'delay'
  | 'reverb'
  | 'eq'
  | 'pitch'
  | 'filters'
  | 'acoustic'
  | 'utility';

export type ManualTableRow = Array<string | null | undefined>;

export type ManualTable = ManualTableRow[];
