export type HotoneManualSource = {
  productId: string;
  productName: string;
  manualId: number;
  manualUrl: string;
  updatedAt: string;
  firmwareLabel?: string;
};

import type { ManualCategory } from '../manual/types';

export type HotoneUnifiedEffect = {
  title: string;
  description: string;
  category: ManualCategory;
  subtype?: string;
  pedalboards: string[];
};

export type HotoneEffectInput = {
  title: string;
  description: string;
  category: ManualCategory;
  subtype?: string;
  pedalboard: string;
};
