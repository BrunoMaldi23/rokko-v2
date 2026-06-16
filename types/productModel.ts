export type ProductModel = {
  id: string;
  name: string;
  category: string;
  product_id: string | null;
  model_url: string;
  file_path: string;
  scale: number;
  position_y: number;
  rotation_y: number;
  base_model?: boolean;
  created_at?: string | null;
};
