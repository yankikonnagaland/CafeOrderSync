import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { OrderWithItems } from "@shared/schema";

export function useActiveOrders() {
  return useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });
}

export function useOrder(orderNumber: string) {
  return useQuery<OrderWithItems>({
    queryKey: ["/api/orders", orderNumber],
    enabled: !!orderNumber,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: {
      tableNumber: number;
      customerName?: string;
      customerPhone?: string;
      items: Array<{
        itemName: string;
        quantity: number;
        price: string;
      }>;
    }) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderNumber, orderData }: {
      orderNumber: string;
      orderData: {
        tableNumber: number;
        customerName?: string;
        customerPhone?: string;
        items: Array<{
          itemName: string;
          quantity: number;
          price: string;
        }>;
      };
    }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderNumber}`, orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderNumber: string) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderNumber}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}
