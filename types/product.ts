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
  model_3d_url?: string | null;
  model_3d_scale?: number | null;
  model_3d_position_y?: number | null;
  model_3d_rotation_y?: number | null;
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
  created_at?: string | null;
};
