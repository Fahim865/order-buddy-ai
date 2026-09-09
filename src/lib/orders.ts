export type OrderRecord = Record<string, string>;

export const ORDERS: Record<string, OrderRecord> = {
  "ORD-1001": {
    order_id: "ORD-1001",
    status: "Shipped",
    item: "Wireless Headphones",
    carrier: "DHL",
    tracking_number: "DHL-9F2K-88213",
    estimated_delivery: "Tomorrow",
  },
  "ORD-1002": {
    order_id: "ORD-1002",
    status: "Pending",
    item: "Mechanical Keyboard",
    payment: "Verified",
    dispatch: "In 2 days",
    tracking_number: "Not assigned yet",
  },
  "ORD-1003": {
    order_id: "ORD-1003",
    status: "Delivered",
    item: "Smart Watch",
    delivered_on: "Yesterday",
    carrier: "FedEx",
    tracking_number: "FDX-4471-00219",
  },
  "ORD-1004": {
    order_id: "ORD-1004",
    status: "Cancelled",
    item: "Gaming Mouse",
    reason: "Customer request",
    refund: "Processed to original payment method",
  },
};

export function getOrderStatus(orderId: string) {
  const key = String(orderId ?? "").trim().toUpperCase();
  const order = ORDERS[key];
  if (!order) {
    return {
      success: false,
      error: "ORDER_NOT_FOUND",
      message: `No order found with id ${key}. Ask the customer to double-check the ID.`,
    };
  }
  return { success: true, order };
}
