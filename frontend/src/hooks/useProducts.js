import { useEffect, useState } from "react";
import { productService } from "../services/productService.js";

export function useProducts(role) {
  const [products, setProducts] = useState([]);

  async function refresh() {
    const fetcher = role === "COMPANY" ? productService.listMine() : productService.list();
    setProducts(await fetcher);
  }

  useEffect(() => {
    refresh().catch(() => setProducts([]));
  }, []);

  return { products, refresh };
}
