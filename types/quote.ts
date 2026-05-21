export type QuoteItem = {
  id: number;
  productId: string;
  emoji: string;
  name: string;
  fabric: string;
  quantity: number;
  color: string;
  size: string;
  logo: string | null;
  unitPrice: number;
  subtotal: number;
};