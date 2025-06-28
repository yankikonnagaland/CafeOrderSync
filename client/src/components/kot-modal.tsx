import { X, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { OrderWithItems } from "@shared/schema";

interface KOTModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithItems | null;
}

export default function KOTModal({ open, onOpenChange, order }: KOTModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    const printContent = document.querySelector('.kot-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Kitchen Order Ticket - ${order.orderNumber}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; }
                .kot-header { text-align: center; margin-bottom: 20px; }
                .kot-details { margin-bottom: 15px; }
                .kot-items { margin-top: 15px; }
                .kot-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-ios-dark">
            Kitchen Order Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="kot-print-content border border-gray-200 rounded-xl p-4 mb-6">
          <div className="kot-header text-center mb-4">
            <h4 className="text-lg font-bold text-ios-dark">Pikonik Cafe</h4>
            <p className="text-sm text-ios-gray">Kitchen Order Ticket</p>
          </div>

          <div className="kot-details space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-ios-gray">Order #</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ios-gray">Table</span>
              <span className="font-medium">{order.tableNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ios-gray">Time</span>
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
            {order.customerName && (
              <div className="flex justify-between text-sm">
                <span className="text-ios-gray">Customer</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <div className="kot-items space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="kot-item flex justify-between text-sm">
                <span>{item.itemName}</span>
                <span className="font-medium">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-ios-blue text-white hover:bg-blue-600 h-12 rounded-xl font-medium"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print KOT
          </Button>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-gray-100 text-ios-gray hover:bg-gray-200 h-12 rounded-xl font-medium border-none"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
