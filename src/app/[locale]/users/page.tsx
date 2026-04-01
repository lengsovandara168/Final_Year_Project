import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { getServerSession } from "@/lib/auth-server";
import { getCategoryBoard, getProducts } from "@/lib/api";
import {
  deduplicateProductTemplates,
  mapBrandsByCategory,
} from "@/lib/shop.utils";
import ProductListing from "./ProductListing";

export default async function ShopPage() {
  const queryClient = new QueryClient();
  const { accessToken } = await getServerSession();

  if (accessToken) {
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ["shop-categories-board"],
        queryFn: async () => {
          const response = await getCategoryBoard(accessToken);
          return mapBrandsByCategory(response.data || []);
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["shop-products", "all"],
        queryFn: async () => {
          const response = await getProducts(accessToken);
          return deduplicateProductTemplates(response.data || []);
        },
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListing />
    </HydrationBoundary>
  );
}
