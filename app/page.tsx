import HomeClient from "@/components/HomeClient";
import { getProductCategories } from "@/lib/productCategories";
import { getAllProducts } from "@/lib/products";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getProductCategories({ activeOnly: true }),
  ]);
  return <HomeClient initialProducts={products} initialCategories={categories} />;
}
