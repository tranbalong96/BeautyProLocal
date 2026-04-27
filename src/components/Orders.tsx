import React, { useState, useMemo } from 'react';
import { User, Order } from '../lib/types';
import { fmt, fmtDate, cn } from '../lib/utils';
import { Search, Eye, Download, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface OrdersProps {
  user: User;
}

export default function Orders({ user }: OrdersProps) {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  const exportReceiptImage = (order: Order) => {
    const canvas = document.createElement('canvas');
    const width = 900;
    const lineHeight = 34;
    const itemLines = order.items.reduce((sum, item) => sum + wrapText(item.name, 30).length, 0);
    const height = 820 + itemLines * lineHeight + (order.note ? 80 : 0);
    const scale = window.devicePixelRatio || 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#FAFAF9';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 40, 40, width - 80, height - 80, 28);
    ctx.fill();

    let y = 108;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7C3AED';
    ctx.font = '900 42px Inter, Arial, sans-serif';
    ctx.fillText(user.shop || 'Hoá đơn dịch vụ', width / 2, y);
    y += 42;
    ctx.fillStyle = '#111827';
    ctx.font = '800 24px Inter, Arial, sans-serif';
    ctx.fillText('Hoá đơn dịch vụ', width / 2, y);
    y += 36;
    ctx.fillStyle = '#6B7280';
    ctx.font = '600 18px Inter, Arial, sans-serif';
    ctx.fillText(`Mã hoá đơn: ${order.id.slice(0, 8)} • ${fmtDate(order.date)}`, width / 2, y);

    y += 58;
    drawDivider(ctx, y, width);
    y += 42;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#111827';
    ctx.font = '800 24px Inter, Arial, sans-serif';
    ctx.fillText(order.customer, 80, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#7C3AED';
    ctx.fillText(methods[order.method] || order.method, width - 80, y);
    y += 44;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B7280';
    ctx.font = '800 15px Inter, Arial, sans-serif';
    ctx.fillText('DỊCH VỤ', 80, y);
    ctx.textAlign = 'center';
    ctx.fillText('SL', 500, y);
    ctx.textAlign = 'right';
    ctx.fillText('ĐƠN GIÁ', 660, y);
    ctx.textAlign = 'right';
    ctx.fillText('THÀNH TIỀN', width - 80, y);
    y += 22;
    drawDivider(ctx, y, width);
    y += 36;

    order.items.forEach(item => {
      const lines = wrapText(item.name, 30);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#111827';
      ctx.font = '700 21px Inter, Arial, sans-serif';
      lines.forEach((line, idx) => {
        ctx.fillText(line, 80, y + idx * lineHeight);
      });
      ctx.textAlign = 'center';
      ctx.fillStyle = '#111827';
      ctx.font = '800 20px Inter, Arial, sans-serif';
      ctx.fillText(String(item.qty), 500, y);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#111827';
      ctx.font = '700 19px Inter, Arial, sans-serif';
      ctx.fillText(fmt(item.price), 660, y);
      ctx.fillStyle = '#7C3AED';
      ctx.font = '900 21px Inter, Arial, sans-serif';
      ctx.fillText(fmt(item.price * item.qty), width - 80, y);
      y += Math.max(lines.length, 1) * lineHeight + 24;
    });

    drawDivider(ctx, y, width);
    y += 44;
    drawAmountRow(ctx, 'Thành tiền', fmt(order.subtotal), y, width);
    y += 34;
    drawAmountRow(ctx, 'Giảm giá', `-${fmt(order.discount)}`, y, width, '#EF4444');
    y += 48;
    drawDivider(ctx, y, width);
    y += 56;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#111827';
    ctx.font = '900 26px Inter, Arial, sans-serif';
    ctx.fillText('Tổng thanh toán', 80, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#7C3AED';
    ctx.font = '900 36px Inter, Arial, sans-serif';
    ctx.fillText(fmt(order.total), width - 80, y);
    y += 42;

    if (order.note) {
      y += 58;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6B7280';
      ctx.font = '700 16px Inter, Arial, sans-serif';
      ctx.fillText(`Ghi chú: ${order.note}`, 80, y);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '600 15px Inter, Arial, sans-serif';
    ctx.fillText('Cảm ơn quý khách và hẹn gặp lại.', width / 2, height - 82);

    const link = document.createElement('a');
    link.download = `beautypro-hoa-don-${order.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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
                    <button onClick={() => setSelectedOrder(o)} className="p-2 hover:bg-accent-light hover:text-accent rounded-lg transition-all text-gray-400 flex items-center justify-end gap-1">
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

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900">Chi tiết hoá đơn</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">#{selectedOrder.id.slice(0, 8)} • {fmtDate(selectedOrder.date)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="rounded-full p-1 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Khách hàng</div>
                <div className="mt-1 text-lg font-black text-gray-900">{selectedOrder.customer}</div>
                <div className="mt-2 inline-flex rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-gray-500">
                  {methods[selectedOrder.method] || selectedOrder.method}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 p-4">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="mt-1 text-xs font-medium text-gray-500">{fmt(item.price)} x {item.qty}</div>
                    </div>
                    <div className="shrink-0 text-sm font-black text-accent">{fmt(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 rounded-2xl bg-accent-light p-4">
                <AmountLine label="Tạm tính" value={fmt(selectedOrder.subtotal)} />
                <AmountLine label="Giảm giá" value={`-${fmt(selectedOrder.discount)}`} danger />
                <div className="border-t border-accent/10 pt-3">
                  <AmountLine label="Tổng cộng" value={fmt(selectedOrder.total)} total />
                </div>
              </div>

              {selectedOrder.note && (
                <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                  {selectedOrder.note}
                </div>
              )}

              <button onClick={() => exportReceiptImage(selectedOrder)} className="mt-6 w-full rounded-2xl bg-accent py-4 font-bold text-white shadow-xl shadow-accent/20 transition-all hover:bg-accent-dark flex items-center justify-center gap-2">
                <Download className="h-5 w-5" />
                Xuất ảnh hoá đơn
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AmountLine({ label, value, danger = false, total = false }: { label: string, value: string, danger?: boolean, total?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", total ? "text-lg font-black" : "text-sm font-bold")}>
      <span className={total ? "text-gray-900" : "text-gray-500"}>{label}</span>
      <span className={cn(total ? "text-accent" : "text-gray-900", danger && "text-rose-500")}>{value}</span>
    </div>
  );
}

function wrapText(text: string, maxLength: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach(word => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number, width: number) {
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, y);
  ctx.lineTo(width - 80, y);
  ctx.stroke();
}

function drawAmountRow(ctx: CanvasRenderingContext2D, label: string, value: string, y: number, width: number, color = '#111827') {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6B7280';
  ctx.font = '700 18px Inter, Arial, sans-serif';
  ctx.fillText(label, 80, y);
  ctx.textAlign = 'right';
  ctx.fillStyle = color;
  ctx.font = '800 20px Inter, Arial, sans-serif';
  ctx.fillText(value, width - 80, y);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
