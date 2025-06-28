import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema, insertMenuItemSchema } from "@shared/schema";
import { z } from "zod";

const createOrderRequestSchema = z.object({
  tableNumber: z.number().min(1).max(30),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(z.object({
    itemName: z.string().min(1),
    quantity: z.number().min(1),
    price: z.string().min(1),
  })).min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all menu items (for suggestions)
  app.get("/api/menu-items", async (req, res) => {
    try {
      const items = await storage.getAllMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  // Create or update menu item
  app.post("/api/menu-items", async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      
      // Check if item already exists, update price if it does
      const existingItem = await storage.getMenuItemByName(validatedData.name);
      if (existingItem) {
        res.json(existingItem);
        return;
      }

      const item = await storage.createMenuItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create menu item" });
      }
    }
  });

  // Get all active orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllActiveOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get order by number
  app.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Create new order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = createOrderRequestSchema.parse(req.body);
      
      // Calculate total
      const total = validatedData.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0);

      // Generate order number
      const orderNumber = (storage as any).generateOrderNumber();

      // Create order
      const orderData = {
        orderNumber,
        tableNumber: validatedData.tableNumber,
        customerName: validatedData.customerName || null,
        customerPhone: validatedData.customerPhone || null,
        status: "active",
        total: total.toString(),
      };

      const order = await storage.createOrder(orderData);

      // Create order items
      const orderItems = await Promise.all(
        validatedData.items.map(async (item) => {
          const itemTotal = parseFloat(item.price) * item.quantity;
          return await storage.createOrderItem({
            orderId: order.id,
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
            total: itemTotal.toString(),
          });
        })
      );

      // Also save as menu item for suggestions
      await Promise.all(
        validatedData.items.map(async (item) => {
          const existingMenuItem = await storage.getMenuItemByName(item.itemName);
          if (!existingMenuItem) {
            await storage.createMenuItem({
              name: item.itemName,
              price: item.price,
            });
          }
        })
      );

      const orderWithItems = { ...order, items: orderItems };
      res.status(201).json(orderWithItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Update order (for editing)
  app.put("/api/orders/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      const validatedData = createOrderRequestSchema.parse(req.body);
      
      // Calculate new total
      const total = validatedData.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0);

      // Update order
      const updatedOrder = await storage.updateOrderStatus(order.id, "active");
      if (updatedOrder) {
        (updatedOrder as any).tableNumber = validatedData.tableNumber;
        (updatedOrder as any).customerName = validatedData.customerName || null;
        (updatedOrder as any).customerPhone = validatedData.customerPhone || null;
        (updatedOrder as any).total = total.toString();
      }

      // Delete existing order items
      const existingItems = await storage.getOrderItems(order.id);
      await Promise.all(existingItems.map(item => storage.deleteOrderItem(item.id)));

      // Create new order items
      const orderItems = await Promise.all(
        validatedData.items.map(async (item) => {
          const itemTotal = parseFloat(item.price) * item.quantity;
          return await storage.createOrderItem({
            orderId: order.id,
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
            total: itemTotal.toString(),
          });
        })
      );

      const orderWithItems = { ...updatedOrder, items: orderItems };
      res.json(orderWithItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update order" });
      }
    }
  });

  // Complete order (generate bill)
  app.patch("/api/orders/:orderNumber/complete", async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      const updatedOrder = await storage.updateOrderStatus(order.id, "completed");
      res.json({ ...updatedOrder, items: order.items });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
