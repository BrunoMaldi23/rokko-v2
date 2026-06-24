import type { PriceTier, Product } from "@/types/product";

export function normalizePriceTiers(tiers: unknown): PriceTier[] {
  if (!Array.isArray(tiers)) return [];

  return tiers
    .map((tier) => {
      if (!tier || typeof tier !== "object") return null;
      const record = tier as Record<string, unknown>;
      const from = Math.floor(Number(record.from || 0));
      const price = Math.round(Number(record.price || 0));
      if (from <= 0 || price <= 0) return null;
      return { from, price };
    })
    .filter((tier): tier is PriceTier => Boolean(tier))
    .sort((a, b) => a.from - b.from);
}

export function getProductPriceTiers(product: Pick<Product, "price_tiers" | "wholesale_from" | "wholesale_price">) {
  const tiers = normalizePriceTiers(product.price_tiers);
  if (tiers.length > 0) return tiers;

  if (product.wholesale_from && product.wholesale_price) {
    return normalizePriceTiers([
      { from: product.wholesale_from, price: product.wholesale_price },
    ]);
  }

  return [];
}

export function getUnitPriceForQuantity(
  product: Pick<Product, "price" | "price_tiers" | "wholesale_from" | "wholesale_price">,
  quantity: number,
  commercialWholesaleMin = 0,
) {
  const totalUnits = Math.max(0, Math.floor(Number(quantity || 0)));
  const tiers = getProductPriceTiers(product);
  const applicable = tiers.filter((tier) => totalUnits >= tier.from);
  const matched = applicable[applicable.length - 1];

  if (matched) return matched.price;

  if (
    !tiers.length &&
    commercialWholesaleMin &&
    product.wholesale_price &&
    totalUnits >= commercialWholesaleMin
  ) {
    return product.wholesale_price;
  }

  return Number(product.price || 0);
}
