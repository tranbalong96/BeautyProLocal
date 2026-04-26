import React, { useMemo } from 'react';
import { User, Order, Appointment } from '../lib/types';
import { fmt, today, cn } from '../lib/utils';
import { 
  TrendingUp, 
  CreditCard, 
  CalendarCheck, 
  Users, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { NavPath } from '../App';

interface DashboardProps {
  user: User;
  setPath: (path: NavPath) => void;
}

export default function Dashboard({ user, setPath }: DashboardProps) {
  const orders = useMemo(() => JSON.parse(localStorage.getItem(`bp_orders_${user.id}`) || '[]') as Order[], [user.id]);
  const appts = useMemo(() => JSON.parse(localStorage.getItem(`bp_appointments_${user.id}`) || '[]') as Appointment[], [user.id]);
  const customers = useMemo(() => JSON.parse(localStorage.getItem(`bp_customers_${user.id}`) || '[]'), [user.id]);

  const tDate = today();
  const todayOrders = orders.filter(o => o.date === tDate);
  const monthOrders = orders.filter(o => o.date.startsWith(tDate.slice(0, 7)));

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
  const todayAppts = appts.filter(a => a.date === tDate && a.status === 'pending');

  const stats = [
    { label: 'Doanh thu hôm nay', value: fmt(todayRevenue), trend: '+12%', sub: `${todayOrders.length} đơn`, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent-light' },
    { label: 'Doanh thu tháng này', value: fmt(monthRevenue), trend: '+8.4%', sub: `${monthOrders.length} đơn`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Lịch hẹn hôm nay', value: todayAppts.length, trend: 'Đang đợi', sub: 'Chưa phục vụ', icon: CalendarCheck, color: 'text-rose-brand', bg: 'bg-rose-50' },
    { label: 'Tổng khách hàng', value: customers.length, trend: 'Tăng trưởng', sub: 'Khách quay lại', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const recentOrders = orders.slice(-5).reverse();
  const upcomingAppts = appts.filter(a => a.date >= tDate && a.status === 'pending')
                             .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                             .slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Tổng quan 🏠</h1>
          <p className="text-gray-500 font-medium">Chào mừng trở lại, {user.shop}. Hôm nay bạn cảm thấy thế nào?</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-700 tracking-tight">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2.5 rounded-xl transition-colors", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-bold text-gray-400 group-hover:text-accent transition-colors">
                <span className="uppercase tracking-widest">{s.trend}</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-gray-900">Hoá đơn vừa tạo 🧾</h2>
            <button onClick={() => setPath('orders')} className="text-xs font-bold text-accent hover:underline flex items-center gap-1 uppercase tracking-widest">
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentOrders.map((o) => (
                  <div key={o.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm uppercase">
                        {o.customer[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{o.customer}</div>
                        <div className="text-[11px] text-gray-500 font-medium">{o.items.map(i => i.name).join(', ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-accent">{fmt(o.total)}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{o.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <p className="text-sm italic">Chưa có hoạt động giao dịch gần đây.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-gray-900">Lịch đang đợi ⏳</h2>
            <button onClick={() => setPath('schedule')} className="text-xs font-bold text-accent hover:underline flex items-center gap-1 uppercase tracking-widest">
              Chi tiết <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4 min-h-[300px]">
            {upcomingAppts.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppts.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-3 relative group">
                    <div className="flex flex-col items-center justify-center min-w-[50px] py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">{a.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{a.name}</div>
                      <div className="text-[11px] text-gray-500 font-medium truncate">{a.svc || 'Chưa chọn dịch vụ'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 grayscale opacity-50">
                <CalendarCheck className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-400 font-medium">Hiện không có lịch hẹn sắp tới.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
