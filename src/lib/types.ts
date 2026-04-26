/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IndustryType = 'nail' | 'spa' | 'makeup' | 'mi' | 'toc' | 'wax' | 'facial' | 'other';

export interface User {
  id: string;
  email: string;
  pass: string;
  shop: string;
  industry: IndustryType;
}

export interface Service {
  id: string;
  name: string;
  type: 'service' | 'combo';
  groupId?: string;
  groupName?: string;
  price: number;
  dur: number;
  desc: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  desc: string;
  services: Service[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  dob: string;
  note: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  svc: string;
  note: string;
  status: 'pending' | 'done' | 'cancelled';
}

export interface OrderItem extends Service {
  qty: number;
}

export interface Order {
  id: string;
  date: string;
  customer: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  method: string;
  note: string;
  createdAt: string;
}
