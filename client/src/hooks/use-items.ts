import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { MenuItem } from "@shared/schema";

export function useMenuItems() {
  return useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemData: { name: string; price: string }) => {
      const response = await apiRequest("POST", "/api/menu-items", itemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    },
  });
}
