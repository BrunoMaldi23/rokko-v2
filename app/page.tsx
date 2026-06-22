import HomeClient from "@/components/HomeClient";
import { getAllProducts } from "@/lib/products";

export default async function Home() {
  const products = await getAllProducts();
  return <HomeClient initialProducts={products} />;
}
