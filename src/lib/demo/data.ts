// Realistic SME demo dataset covering all 5 demo questions:
// 1. "Which customers owe us money?" → customers with amount_owed > 0
// 2. "Who is cheapest for office chairs?" → 3 suppliers selling office chairs
// 3. "What orders are still pending?" → 6+ pending orders
// 4. "What did we discuss with Ahmed?" → Ahmed in customers, orders, follow_ups
// 5. "What were last month's sales?" → orders from last month

import type { CustomerInput, OrderInput, SupplierInput, FollowUpInput } from '@/lib/validation/schemas';

const today = new Date();
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString().split('T')[0];
const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
const nextWeek = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0];
const overdue1 = new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0];
const overdue2 = new Date(today.getTime() - 10 * 86400000).toISOString().split('T')[0];
const overdue3 = new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0];
const tomorrow = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
const twoWeeks = new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0];
const todayStr = today.toISOString().split('T')[0];

export const DEMO_CUSTOMERS: CustomerInput[] = [
  { name: 'Ahmed Al-Rashid', phone: '+92-300-1234567', amount_owed: 1200, last_order: lastMonth, status: 'pending' },
  { name: 'Sara Malik', phone: '+92-321-9876543', amount_owed: 850, last_order: yesterday, status: 'active' },
  { name: 'Khalid Enterprises', phone: '+92-333-5556677', amount_owed: 3400, last_order: overdue2, status: 'pending' },
  { name: 'Fatima Trading Co.', phone: '+92-312-4445566', amount_owed: 0, last_order: lastMonth, status: 'active' },
  { name: 'Omar Business Solutions', phone: '+92-345-7778899', amount_owed: 650, last_order: overdue1, status: 'pending' },
  { name: 'Zainab Textiles', phone: '+92-311-2223344', amount_owed: 0, last_order: nextWeek, status: 'active' },
  { name: 'Hassan Brothers', phone: '+92-334-6667788', amount_owed: 2100, last_order: overdue3, status: 'pending' },
  { name: 'Aisha General Store', phone: '+92-315-8889900', amount_owed: 0, last_order: todayStr, status: 'active' },
  { name: 'Bilal Wholesale', phone: '+92-322-1112233', amount_owed: 450, last_order: lastMonth, status: 'active' },
  { name: 'Nadia Imports', phone: '+92-303-4445566', amount_owed: 0, last_order: twoWeeks, status: 'inactive' },
  { name: 'Tariq Electronics', phone: '+92-331-7778899', amount_owed: 980, last_order: yesterday, status: 'pending' },
  { name: 'Sana Office Supplies', phone: '+92-341-0001122', amount_owed: 0, last_order: nextWeek, status: 'active' },
  { name: 'Imran Furniture', phone: '+92-302-3334455', amount_owed: 1750, last_order: overdue2, status: 'pending' },
  { name: 'Rania Distributors', phone: '+92-344-6667788', amount_owed: 0, last_order: lastMonth, status: 'active' },
  { name: 'Usman & Sons', phone: '+92-313-9990011', amount_owed: 320, last_order: yesterday, status: 'active' },
];

export const DEMO_ORDERS: OrderInput[] = [
  { order_id: 'ORD-1001', customer_name: 'Ahmed Al-Rashid', item: 'Office Chairs', quantity: 10, due_date: overdue1, status: 'overdue' },
  { order_id: 'ORD-1002', customer_name: 'Ahmed Al-Rashid', item: 'Office Desks', quantity: 5, due_date: nextWeek, status: 'pending' },
  { order_id: 'ORD-1003', customer_name: 'Sara Malik', item: 'Stationery Pack', quantity: 50, due_date: yesterday, status: 'overdue' },
  { order_id: 'ORD-1004', customer_name: 'Khalid Enterprises', item: 'Printer Paper (Box)', quantity: 30, due_date: overdue2, status: 'overdue' },
  { order_id: 'ORD-1005', customer_name: 'Fatima Trading Co.', item: 'Office Chairs', quantity: 6, due_date: lastMonth, status: 'completed' },
  { order_id: 'ORD-1006', customer_name: 'Omar Business Solutions', item: 'Laptop Bags', quantity: 15, due_date: nextWeek, status: 'pending' },
  { order_id: 'ORD-1007', customer_name: 'Hassan Brothers', item: 'Filing Cabinets', quantity: 8, due_date: overdue3, status: 'overdue' },
  { order_id: 'ORD-1008', customer_name: 'Aisha General Store', item: 'Pens & Markers Set', quantity: 100, due_date: todayStr, status: 'pending' },
  { order_id: 'ORD-1009', customer_name: 'Bilal Wholesale', item: 'Notebooks (Case)', quantity: 200, due_date: nextWeek, status: 'pending' },
  { order_id: 'ORD-1010', customer_name: 'Tariq Electronics', item: 'USB Hubs', quantity: 20, due_date: twoWeeks, status: 'pending' },
  { order_id: 'ORD-1011', customer_name: 'Sana Office Supplies', item: 'Whiteboard Markers', quantity: 60, due_date: lastMonth, status: 'completed' },
  { order_id: 'ORD-1012', customer_name: 'Imran Furniture', item: 'Office Chairs', quantity: 20, due_date: overdue2, status: 'overdue' },
  { order_id: 'ORD-1013', customer_name: 'Rania Distributors', item: 'A4 Paper Reams', quantity: 500, due_date: lastMonth, status: 'completed' },
  { order_id: 'ORD-1014', customer_name: 'Usman & Sons', item: 'Desk Lamps', quantity: 12, due_date: nextWeek, status: 'pending' },
  { order_id: 'ORD-1015', customer_name: 'Zainab Textiles', item: 'Label Printers', quantity: 3, due_date: twoWeeks, status: 'pending' },
  { order_id: 'ORD-1016', customer_name: 'Ahmed Al-Rashid', item: 'Printer Cartridges', quantity: 24, due_date: lastMonth, status: 'completed' },
  { order_id: 'ORD-1017', customer_name: 'Fatima Trading Co.', item: 'Meeting Room Chairs', quantity: 12, due_date: twoWeeks, status: 'pending' },
  { order_id: 'ORD-1018', customer_name: 'Khalid Enterprises', item: 'Standing Desks', quantity: 4, due_date: tomorrow, status: 'pending' },
  { order_id: 'ORD-1019', customer_name: 'Sara Malik', item: 'Filing Folders (Box)', quantity: 10, due_date: lastMonth, status: 'completed' },
  { order_id: 'ORD-1020', customer_name: 'Nadia Imports', item: 'Coffee Machine', quantity: 1, due_date: lastMonth, status: 'completed' },
];

export const DEMO_SUPPLIERS: SupplierInput[] = [
  { supplier_name: 'Al-Amin Furniture Co.', item: 'Office Chairs', unit_price: 85, lead_time: '3-5 days' },
  { supplier_name: 'Supreme Office Solutions', item: 'Office Chairs', unit_price: 72, lead_time: '5-7 days' },
  { supplier_name: 'Value Furnishings Pvt.', item: 'Office Chairs', unit_price: 68, lead_time: '7-10 days' },
  { supplier_name: 'Al-Amin Furniture Co.', item: 'Office Desks', unit_price: 150, lead_time: '3-5 days' },
  { supplier_name: 'Supreme Office Solutions', item: 'Office Desks', unit_price: 135, lead_time: '5-7 days' },
  { supplier_name: 'Paper Plus', item: 'A4 Paper Reams', unit_price: 8, lead_time: '1-2 days' },
  { supplier_name: 'StatSupply Co.', item: 'A4 Paper Reams', unit_price: 7, lead_time: '2-3 days' },
  { supplier_name: 'TechGear Distributors', item: 'USB Hubs', unit_price: 22, lead_time: '4-6 days' },
];

export const DEMO_FOLLOW_UPS: FollowUpInput[] = [
  { type: 'payment', title: 'Call Ahmed Al-Rashid for pending payment', description: 'Outstanding: $1,200 for ORD-1001 (office chairs)', due_date: todayStr, status: 'pending' },
  { type: 'order', title: 'Confirm delivery for ORD-1002', description: 'Ahmed\'s desk order due next week — confirm supplier dispatch', due_date: tomorrow, status: 'pending' },
  { type: 'payment', title: 'Follow up with Khalid Enterprises on $3,400 dues', description: 'Two overdue orders. Escalate if no response by today', due_date: overdue1, status: 'pending' },
  { type: 'order', title: 'Resolve ORD-1007 — Hassan Brothers filing cabinets overdue', description: 'Order is 3 days overdue. Check supplier status', due_date: overdue3, status: 'pending' },
  { type: 'payment', title: 'Hassan Brothers payment follow-up', description: 'Total owed: $2,100. Contact Mr. Hassan directly', due_date: yesterday, status: 'pending' },
  { type: 'supplier', title: 'Get updated quote from Value Furnishings for bulk chairs', description: 'Request 50-unit discount pricing for next quarter', due_date: nextWeek, status: 'pending' },
  { type: 'customer', title: 'Check in with Nadia Imports — inactive account', description: 'No orders in 2 months. Schedule a call to understand needs', due_date: twoWeeks, status: 'pending' },
  { type: 'order', title: 'Confirm ORD-1018 delivery timeline', description: 'Khalid Enterprises standing desks due tomorrow', due_date: tomorrow, status: 'pending' },
  { type: 'payment', title: 'Collect payment from Omar Business Solutions', description: 'Outstanding: $650 for laptop bags order', due_date: nextWeek, status: 'pending' },
  { type: 'supplier', title: 'Compare paper suppliers for next bulk order', description: 'StatSupply is $1 cheaper per ream. Evaluate reliability', due_date: twoWeeks, status: 'pending' },
];

export const DEMO_DOCUMENTS = [
  {
    file_name: 'meeting_notes_june.txt',
    file_type: 'txt' as const,
    raw_text: `Meeting Notes - June 2025

Discussed Ahmed Al-Rashid's outstanding order for 10 office chairs (ORD-1001). 
Ahmed mentioned he would pay the $1,200 balance by end of this week.
He also placed a new order for 5 office desks - to be delivered next week.
We agreed on a 5% discount for his next order if payment clears on time.

Khalid Enterprises: Mr. Khalid called about his standing desks order (ORD-1018).
Confirmed delivery for tomorrow. He asked about bulk pricing for Q3.

Supplier review: Value Furnishings quoted $68/chair, which is cheaper than our current supplier.
Decision: trial order of 20 chairs to test quality before switching fully.

Action items:
- Follow up with Ahmed for payment
- Send delivery confirmation to Khalid
- Request quality samples from Value Furnishings`,
    structured: true,
  },
];
