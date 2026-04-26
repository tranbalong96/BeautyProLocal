import React, { useMemo, useState } from 'react';
import { User, Order } from '../lib/types';
import { fmt, cn } from '../lib/utils';
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'motion/react';

interface StatsProps {
  user: User;
}

export default function Stats({ user }: StatsProps) {
  const [period, setPeriod] = useState(30);
  const orders = useMemo(() => JSON.parse(localStorage.getItem(`bp_orders_${user.id}`) || '[]') as Order[], [user.id]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period);
  const filtered = orders.filter(o => new Date(o.date) >= cutoff);

  const totalRev = filtered.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = filtered.length > 0 ? Math.round(totalRev / filtered.length) : 0;

  // Chart: Daily Revenue (last 7 days fixed for chart view)
  const dailyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const rev = orders.filter(o => o.date === ds).reduce((s, o) => s + o.total, 0);
      days.push({ 
        name: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
        revenue: rev
      });
    }
    return days;
  }, [orders]);

  // Top Services
  const topServices = useMemo(() => {
    const sc: Record<string, number> = {};
    filtered.forEach(o => o.items.forEach(i => {
      sc[i.name] = (sc[i.name] || 0) + i.qty * i.price;
    }));
    return Object.entries(sc)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Payment methods for Pie Chart
  const payData = useMemo(() => {
    const pm: Record<string, number> = {};
    filtered.forEach(o => { pm[o.method] = (pm[o.method] || 0) + o.total; });
    const labels: Record<string, string> = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', momo: 'MoMo', zalopay: 'ZaloPay', card: 'Cà thẻ' };
    return Object.entries(pm).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [filtered]);

  const COLORS = ['#7C3AED', '#A855F7', '#EC4899', '#F43F5E', '#FB923C'];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Thống kê & Phân tích</h2>
          <p className="text-sm font-medium text-gray-500">Dữ liệu kinh doanh chi tiết của Salon.</p>
        </div>
        <select 
          value={period}
          onChange={e => setPeriod(parseInt(e.target.value))}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm font-bold shadow-sm"
        >
          <option value={7}>7 ngày qua</option>
          <option value={30}>30 ngày qua</option>
          <option value={90}>90 ngày qua</option>
        </select>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng doanh thu" value={fmt(totalRev)} sub={`${period} ngày qua`} highlight />
        <StatCard label="Số lượng đơn" value={filtered.length} sub="Giao dịch thành công" />
        <StatCard label="Giá trị TB đơn" value={fmt(avgOrder)} sub="Mỗi hoá đơn" />
        <StatCard label="Khách hàng mới" value={filtered.length ? Math.floor(filtered.length * 0.3) : 0} sub="Dự kiến" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-serif font-bold flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-accent" />
            Doanh thu 7 ngày gần đây
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f5f3ff'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value: number) => [fmt(value), 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#7C3AED" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-serif font-bold flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-rose-brand" />
            Phương thức thanh toán
          </h3>
          <div className="h-[250px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payData.length > 0 ? payData : [{name: 'Trống', value: 1}]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(payData.length > 0 ? payData : [{name: 'Trống', value: 1}]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={payData.length > 0 ? COLORS[index % COLORS.length] : '#F3F4F6'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value: number) => [fmt(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 pr-6">
               {payData.map((d, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <div className="w-3 h-3 rounded-sm" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                    <span>{d.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-serif font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Top 5 Dịch vụ mang lại doanh thu cao nhất
        </h3>
        <div className="space-y-4">
          {topServices.map((svc, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-900">{svc.name}</span>
                <span className="text-accent">{fmt(svc.value)}</span>
              </div>
              <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(svc.value / topServices[0].value) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
            </div>
          ))}
          {topServices.length === 0 && <div className="text-center py-12 text-gray-400 font-medium italic">Chưa có dữ liệu giao dịch để phân tích.</div>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, highlight = false }: { label: string, value: string | number, sub: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-6 rounded-3xl border shadow-sm transition-all relative overflow-hidden",
      highlight ? "bg-accent border-accent shadow-accent/20" : "bg-white border-gray-100"
    )}>
      {highlight && <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />}
      <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", highlight ? "text-white/60" : "text-gray-400")}>{label}</div>
      <div className={cn("text-2xl font-black mb-1", highlight ? "text-white" : "text-gray-900")}>{value}</div>
      <div className={cn("text-[11px] font-bold", highlight ? "text-white/70" : "text-gray-400")}>{sub}</div>
    </div>
  );
}
