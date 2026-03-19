import { useQuery } from "@tanstack/react-query";
import { fetchCatalogProducts } from "@/lib/catalog";

export const useCatalogProducts = () =>
  useQuery({
    queryKey: ["catalog-products"],
    queryFn: fetchCatalogProducts,
  });
