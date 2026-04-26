/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(n);
}

export function fmtDate(d: string | number | Date) {
  return new Date(d).toLocaleDateString('vi-VN');
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const K = 'bp_';

export function lsGet<T>(k: string): T | null {
  const v = localStorage.getItem(K + k);
  return v ? JSON.parse(v) : null;
}

export function lsSet(k: string, v: any) {
  localStorage.setItem(K + k, JSON.stringify(v));
}
