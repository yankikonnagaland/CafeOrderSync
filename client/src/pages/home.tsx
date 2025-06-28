import { useState } from "react";
import OrderCreation from "@/components/order-creation";
import OrderList from "@/components/order-list";
import KOTModal from "@/components/kot-modal";
import BillModal from "@/components/bill-modal";
import type { OrderWithItems } from "@shared/schema";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [kotModalOpen, setKotModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

  // Update time every minute
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  });

  const handleGenerateKOT = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setKotModalOpen(true);
  };

  const handleGenerateBill = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setBillModalOpen(true);
  };

  return (
    <div className="bg-ios-light min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-apple border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-ios-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-ios-dark">Pikonik Cafe</h1>
                <p className="text-sm text-ios-gray">Order Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-ios-gray">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
              <div className="w-3 h-3 bg-ios-green rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OrderCreation />
          <OrderList 
            onGenerateKOT={handleGenerateKOT}
            onGenerateBill={handleGenerateBill}
          />
        </div>
      </div>

      <KOTModal 
        open={kotModalOpen}
        onOpenChange={setKotModalOpen}
        order={selectedOrder}
      />

      <BillModal 
        open={billModalOpen}
        onOpenChange={setBillModalOpen}
        order={selectedOrder}
      />
    </div>
  );
}
