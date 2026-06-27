export type ProductCategory = {
  id?: string;
  slug: string;
  label: string;
  description: string;
  code: string;
  sort_order: number;
  active: boolean;
  created_at?: string | null;
};
