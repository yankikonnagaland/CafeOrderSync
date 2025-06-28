import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrder } from "@/hooks/use-orders";
import { useMenuItems } from "@/hooks/use-items";
import { formatCurrency } from "@/lib/utils";

const itemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.string().min(1, "Price is required"),
});

const orderSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;
type OrderFormData = z.infer<typeof orderSchema>;

interface OrderItem {
  itemName: string;
  quantity: number;
  price: string;
  total: number;
}

export default function OrderCreation() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const { data: menuItems = [] } = useMenuItems();

  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemName: "",
      quantity: 1,
      price: "",
    },
  });

  const orderForm = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      tableNumber: "",
      customerName: "",
      customerPhone: "",
    },
  });

  const watchItemName = itemForm.watch("itemName");

  // Auto-suggest functionality
  useEffect(() => {
    if (watchItemName && watchItemName.length > 0) {
      const suggestions = menuItems
        .filter(item => 
          item.name.toLowerCase().includes(watchItemName.toLowerCase())
        )
        .map(item => item.name)
        .slice(0, 5);
      
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [watchItemName, menuItems]);

  // Auto-populate price based on selected item
  useEffect(() => {
    const matchingItem = menuItems.find(
      item => item.name.toLowerCase() === watchItemName.toLowerCase()
    );
    if (matchingItem) {
      itemForm.setValue("price", matchingItem.price);
    }
  }, [watchItemName, menuItems, itemForm]);

  const handleSuggestionClick = (suggestion: string) => {
    itemForm.setValue("itemName", suggestion);
    setShowSuggestions(false);
  };

  const handleAddItem = (data: ItemFormData) => {
    const total = parseFloat(data.price) * data.quantity;
    const newItem: OrderItem = {
      ...data,
      total,
    };

    setOrderItems(prev => [...prev, newItem]);
    itemForm.reset({
      itemName: "",
      quantity: 1,
      price: "",
    });

    toast({
      title: "Item added",
      description: `${data.itemName} added to order`,
    });
  };

  const handleSubmitOrder = (data: OrderFormData) => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      tableNumber: parseInt(data.tableNumber),
      customerName: data.customerName || undefined,
      customerPhone: data.customerPhone || undefined,
      items: orderItems.map(item => ({
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    createOrder.mutate(orderData, {
      onSuccess: () => {
        toast({
          title: "Order submitted",
          description: "Order has been successfully created",
        });
        setOrderItems([]);
        orderForm.reset();
        itemForm.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to submit order",
          variant: "destructive",
        });
      },
    });
  };

  const orderTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      {/* New Order Card */}
      <Card className="shadow-apple-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-ios-dark">New Order</CardTitle>
            <div className="bg-ios-blue/10 px-3 py-1 rounded-full">
              <span className="text-ios-blue text-sm font-medium">Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Table Selection */}
          <div>
            <Label className="text-sm font-medium text-ios-dark">Table Number</Label>
            <Select onValueChange={(value) => orderForm.setValue("tableNumber", value)}>
              <SelectTrigger className="mt-2 h-12 rounded-xl border-gray-200 focus:border-ios-blue">
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 30}, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    Table {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item Details */}
          <form onSubmit={itemForm.handleSubmit(handleAddItem)} className="space-y-4">
            <div className="relative">
              <Label className="text-sm font-medium text-ios-dark">Item Name</Label>
              <Input
                {...itemForm.register("itemName")}
                placeholder="Start typing item name..."
                className="mt-2 h-12 rounded-xl border-gray-200 focus:border-ios-blue"
                autoComplete="off"
              />
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-ios-dark">Quantity</Label>
                <Input
                  {...itemForm.register("quantity", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="mt-2 h-12 rounded-xl border-gray-200 focus:border-ios-blue"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-ios-dark">Price (₹)</Label>
                <Input
                  {...itemForm.register("price")}
                  type="number"
                  step="0.01"
                  placeholder="₹120"
                  className="mt-2 h-12 rounded-xl border-gray-200 focus:border-ios-blue"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-ios-blue hover:bg-blue-600 text-white rounded-xl font-medium"
              disabled={itemForm.formState.isSubmitting}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to Order
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Customer Details */}
      <Card className="shadow-apple">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ios-dark">Customer Details (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-ios-dark">Customer Name</Label>
            <Input
              {...orderForm.register("customerName")}
              placeholder="Enter customer name"
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-ios-blue"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-ios-dark">Phone Number</Label>
            <Input
              {...orderForm.register("customerPhone")}
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-ios-blue"
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="shadow-apple">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ios-dark">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {orderItems.length > 0 ? (
            <div className="space-y-3 mb-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <span className="font-medium text-ios-dark">{item.itemName}</span>
                    <span className="text-ios-gray text-sm ml-2">x{item.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-ios-dark">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ios-gray text-center py-4">No items added yet</p>
          )}

          {orderItems.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-ios-dark">Total</span>
                  <span className="text-2xl font-bold text-ios-blue">{formatCurrency(orderTotal)}</span>
                </div>
                <div className="text-sm text-ios-gray">
                  {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} • Table {orderForm.watch("tableNumber") || "—"}
                </div>
                
                <Button 
                  onClick={orderForm.handleSubmit(handleSubmitOrder)}
                  className="w-full h-12 bg-ios-green hover:bg-green-600 text-white rounded-xl font-semibold"
                  disabled={createOrder.isPending}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Submit Order
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
