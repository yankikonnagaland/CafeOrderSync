import { Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveOrders } from "@/hooks/use-orders";
import { formatCurrency, getTimeSince } from "@/lib/utils";
import type { OrderWithItems } from "@shared/schema";

interface OrderListProps {
  onGenerateKOT: (order: OrderWithItems) => void;
  onGenerateBill: (order: OrderWithItems) => void;
}

export default function OrderList({ onGenerateKOT, onGenerateBill }: OrderListProps) {
  const { data: orders = [], isLoading } = useActiveOrders();

  if (isLoading) {
    return (
      <Card className="shadow-apple-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-ios-dark">Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-ios-gray">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-apple-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold text-ios-dark">Active Orders</CardTitle>
          <Badge variant="secondary" className="bg-ios-orange/10 text-ios-orange border-none">
            {orders.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-ios-gray">No active orders</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="border border-gray-200 rounded-xl p-4 hover:shadow-apple transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-lg font-semibold text-ios-dark">#{order.orderNumber}</span>
                      <Badge variant="secondary" className="bg-ios-blue/10 text-ios-blue border-none text-xs">
                        Table {order.tableNumber}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-ios-gray">
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{formatCurrency(parseFloat(order.total))}</span>
                      <span>•</span>
                      <span className="text-ios-orange font-medium pending-glow">
                        {getTimeSince(new Date(order.createdAt))}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-ios-gray hover:text-ios-blue hover:bg-ios-blue/10 rounded-lg h-auto"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-ios-gray mb-3">
                  {order.customerName ? (
                    <>
                      <span>{order.customerName}</span>
                      {order.customerPhone && (
                        <>
                          <span> • </span>
                          <span>{order.customerPhone}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <span>Walk-in Customer</span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 bg-ios-blue/10 text-ios-blue hover:bg-ios-blue/20 border-none h-9"
                    onClick={() => onGenerateKOT(order)}
                  >
                    Generate KOT
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 bg-ios-green/10 text-ios-green hover:bg-ios-green/20 border-none h-9"
                    onClick={() => onGenerateBill(order)}
                  >
                    Generate Bill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
