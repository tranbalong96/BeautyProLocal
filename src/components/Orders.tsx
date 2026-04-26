import React, { useState, useMemo } from 'react';
import { User, Order } from '../lib/types';
import { fmt, fmtDate, cn } from '../lib/utils';
import { Search, Eye, Download, Printer } from 'lucide-react';

interface OrdersProps {
  user: User;
}

export default function Orders({ user }: OrdersProps) {
  const [search, setSearch] = useState('');
  const orders = useMemo(() => {
    const list = JSON.parse(localStorage.getItem(`bp_orders_${user.id}`) || '[]') as Order[];
    return list.slice().reverse();
  }, [user.id]);

  const filtered = orders.filter(o => 
    o.customer.toLowerCase().includes(search.toLowerCase()) || 
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  const methods: Record<string, string> = {
    cash: 'Tiền mặt',
    transfer: 'Chuyển khoản',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    card: 'Thẻ'
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Lịch sử hoá đơn 🧾</h2>
          <p className="text-sm font-medium text-gray-500">Quản lý và xem lại tất cả giao dịch.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            placeholder="Tìm theo tên khách hoặc mã đơn..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-blue-100 rounded-xl outline-none focus:border-accent text-sm w-full md:w-80 shadow-sm"
          />
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã đơn</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dịch vụ</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng tiền</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thanh toán</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngày</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono font-bold text-gray-400">{o.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{o.customer}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 font-medium max-w-[200px] truncate">
                      {o.items.map(i => i.name).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-accent">{fmt(o.total)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-tight">
                      {methods[o.method] || o.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-500">{fmtDate(o.date)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-accent-light hover:text-accent rounded-lg transition-all text-gray-400 flex items-center justify-end gap-1">
                      <span className="text-sm">👁️</span>
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                    Không tìm thấy hoá đơn nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
