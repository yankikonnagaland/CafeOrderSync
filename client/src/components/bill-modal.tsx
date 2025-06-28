import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCompleteOrder } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/utils";
import type { OrderWithItems } from "@shared/schema";

interface BillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithItems | null;
}

export default function BillModal({ open, onOpenChange, order }: BillModalProps) {
  const { toast } = useToast();
  const completeOrder = useCompleteOrder();

  if (!order) return null;

  const handlePrintAndComplete = () => {
    const printContent = document.querySelector('.bill-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Bill - ${order.orderNumber}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; }
                .bill-header { text-align: center; margin-bottom: 20px; }
                .bill-details { margin-bottom: 15px; }
                .bill-items { margin: 15px 0; }
                .bill-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .bill-total { border-top: 2px solid #000; padding-top: 10px; margin-top: 15px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }

    // Complete the order
    completeOrder.mutate(order.orderNumber, {
      onSuccess: () => {
        toast({
          title: "Order completed",
          description: "Bill generated and order completed successfully",
        });
        onOpenChange(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to complete order",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-ios-dark">
            Generate Bill
          </DialogTitle>
        </DialogHeader>

        <div className="bill-print-content border border-gray-200 rounded-xl p-4 mb-6">
          <div className="bill-header text-center mb-4">
            <h4 className="text-lg font-bold text-ios-dark">Pikonik Cafe</h4>
            <p className="text-xs text-ios-gray">Thank you for dining with us!</p>
          </div>

          <div className="bill-details space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ios-gray">Order #</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ios-gray">Table</span>
              <span className="font-medium">{order.tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ios-gray">Date & Time</span>
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span className="text-ios-gray">Customer</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <div className="bill-items space-y-2 text-sm mb-3">
            {order.items.map((item, index) => (
              <div key={index} className="bill-item flex justify-between">
                <span>{item.itemName} x{item.quantity}</span>
                <span className="font-medium">{formatCurrency(parseFloat(item.total))}</span>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="bill-total">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-ios-blue">{formatCurrency(parseFloat(order.total))}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handlePrintAndComplete}
            disabled={completeOrder.isPending}
            className="flex-1 bg-ios-green text-white hover:bg-green-600 h-12 rounded-xl font-medium"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print & Complete
          </Button>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-gray-100 text-ios-gray hover:bg-gray-200 h-12 rounded-xl font-medium border-none"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
