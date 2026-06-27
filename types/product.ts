import type { ProductMockupCalibrationMap } from "@/types/mockup.types";

export type PriceTier = {
  from: number;
  price: number;
};

export type Product = {
  id: string;
  slug: string;
  category: string;
  name: string;
  short_name: string;
  description: string | null;
  extract: string | null;
  image: string | null;
  images?: string[] | null;
  color_images?: Record<string, string[]> | null;
  price: number;
  wholesale_price: number | null;
  wholesale_from: number | null;
  price_tiers?: PriceTier[] | null;
  sizes: string[];
  colors: string[];
  composition: string | null;
  weight: string | null;
  technologies: string[];
  certifications: string[];
  active: boolean;
  sort_order?: number | null;
  mockup_calibrations?: ProductMockupCalibrationMap | null;
  created_at?: string | null;
};
