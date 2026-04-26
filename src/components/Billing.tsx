import React, { useState, useMemo, useEffect } from 'react';
import { User, Service, ServiceGroup, Customer, OrderItem, Order } from '../lib/types';
import { flattenServiceGroups, loadServiceGroups } from '../lib/services';
import { fmt, today, uid, cn } from '../lib/utils';
import { 
  Search, 
  Plus, 
  Minus, 
  RotateCcw, 
  Check, 
  UserPlus, 
  ArrowRight,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BillingProps {
  user: User;
}

export default function Billing({ user }: BillingProps) {
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [custs, setCusts] = useState<Customer[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [search, setSearch] = useState('');
  
  const [cart, setCart] = useState<Record<string, OrderItem>>({});
  const [selectedCustId, setSelectedCustId] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [payMethod, setPayMethod] = useState('cash');
  const [note, setNote] = useState('');
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useEffect(() => {
    setGroups(loadServiceGroups(user.id));
    setCusts(JSON.parse(localStorage.getItem(`bp_customers_${user.id}`) || '[]'));
  }, [user.id]);

  const svcs = useMemo(() => flattenServiceGroups(groups), [groups]);

  const filteredSvcs = useMemo(() => {
    return svcs.filter(s => {
      const matchGroup = selectedGroupId === 'all' || s.groupId === selectedGroupId;
      const query = search.toLowerCase();
      const matchSearch = s.name.toLowerCase().includes(query) || (s.groupName || '').toLowerCase().includes(query);
      return matchGroup && matchSearch;
    });
  }, [svcs, selectedGroupId, search]);

  const toggleItem = (s: Service) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[s.id]) delete next[s.id];
      else next[s.id] = { ...s, qty: 1 };
      return next;
    });
  };

  const updateQty = (id: string, d: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id]) {
        next[id].qty = Math.max(1, next[id].qty + d);
      }
      return next;
    });
  };

  const subtotal = Object.values(cart).reduce((sum, item: OrderItem) => sum + item.price * item.qty, 0);
  const discount = discountType === 'percent' ? Math.round(subtotal * discountValue / 100) : discountValue;
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) return;
    setIsCheckoutOpen(true);
  };

  const confirmPay = () => {
    const cust = custs.find(c => c.id === selectedCustId);
    const order: Order = {
      id: uid(),
      date: today(),
      customer: cust ? cust.name : 'Khách vãng lai',
      customerId: selectedCustId,
      items: Object.values(cart) as OrderItem[],
      subtotal,
      discount,
      total,
      method: payMethod,
      note,
      createdAt: new Date().toISOString()
    };

    // Save Order
    const orders = JSON.parse(localStorage.getItem(`bp_orders_${user.id}`) || '[]');
    orders.push(order);
    localStorage.setItem(`bp_orders_${user.id}`, JSON.stringify(orders));

    // Update Customer stats
    if (selectedCustId) {
      const updatedCusts = custs.map(c => {
        if (c.id === selectedCustId) {
          return {
            ...c,
            totalOrders: (c.totalOrders || 0) + 1,
            totalSpent: (c.totalSpent || 0) + total,
            lastVisit: today()
          };
        }
        return c;
      });
      localStorage.setItem(`bp_customers_${user.id}`, JSON.stringify(updatedCusts));
      setCusts(updatedCusts);
    }

    setLastOrder(order);
    setIsCheckoutOpen(false);
    setIsDoneOpen(true);
    resetForm();
  };

  const resetForm = () => {
    setCart({});
    setSelectedCustId('');
    setDiscountValue(0);
    setPayMethod('cash');
    setNote('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Product Selection Side */}
      <div className="flex-1 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Màn hình tính tiền</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              placeholder="Tìm dịch vụ..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-blue-100 rounded-xl outline-none focus:border-accent text-sm w-full md:w-64 shadow-sm"
            />
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto rounded-xl bg-gray-100 p-1">
          <Tab active={selectedGroupId === 'all'} onClick={() => setSelectedGroupId('all')} label="Tất cả" />
          {groups.map(group => (
            <Tab key={group.id} active={selectedGroupId === group.id} onClick={() => setSelectedGroupId(group.id)} label={group.name} />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredSvcs.map(s => (
            <button
              key={s.id}
              onClick={() => toggleItem(s)}
              className={cn(
                "p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group h-full flex flex-col justify-between",
                cart[s.id] 
                  ? "bg-accent-light border-accent ring-4 ring-accent/5" 
                  : "bg-white border-transparent shadow-sm hover:border-gray-200"
              )}
            >
              {cart[s.id] && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                  <span className="truncate pr-2">{s.groupName || (s.type === 'combo' ? 'Combo' : 'Dịch vụ')}</span>
                  {s.dur > 0 && <span>{s.dur}ph</span>}
                </div>
                <div className="text-sm font-bold text-gray-900 leading-snug group-hover:text-accent transition-colors">
                  {s.name}
                </div>
              </div>
              <div className="mt-3 text-sm font-black text-accent">{fmt(s.price)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-[380px] shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden sticky top-8">
          <div className="bg-accent p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-xl">Hoá đơn tạm tính</h3>
              <button 
                onClick={resetForm}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Bắt đầu lại"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <select 
                value={selectedCustId}
                onChange={e => setSelectedCustId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-medium outline-none appearance-none cursor-pointer focus:bg-white/20"
              >
                <option value="" className="text-gray-900">Khách vãng lai</option>
                {custs.map(c => <option key={c.id} value={c.id} className="text-gray-900">{c.name} - {c.phone}</option>)}
              </select>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="min-h-[140px] space-y-3">
              {Object.values(cart).length > 0 ? (
                Object.values(cart).map(item => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold">{fmt(item.price)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 px-1 py-1">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-accent"><Minus className="w-3 h-3" /></button>
                        <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-accent"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="text-sm font-bold text-gray-700 min-w-[80px] text-right">{fmt(item.price * item.qty)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 opacity-60">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#E5E7EB]">Giỏ hàng trống</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-dashed border-gray-200 space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Giảm giá</label>
                  <div className="flex gap-1.5 h-10">
                    <input 
                      type="number" 
                      value={discountValue || ''}
                      onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-20 px-3 border border-gray-200 rounded-xl outline-none focus:border-accent text-sm font-bold"
                    />
                    <select 
                      value={discountType}
                      onChange={e => setDiscountType(e.target.value as any)}
                      className="px-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black outline-none cursor-pointer"
                    >
                      <option value="amount">đ</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1 text-right space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>Tạm tính</span>
                    <span className="text-gray-900">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>Giảm giá</span>
                    <span className="text-red-500">-{fmt(discount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-2">
                    <span className="text-sm font-serif">Tổng cộng</span>
                    <span className="text-accent">{fmt(total)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={total === 0}
                className="w-full bg-accent disabled:bg-gray-300 hover:bg-accent-dark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-accent/20"
              >
                Tiếp tục thanh toán
                <ArrowRight className="w-5 h-5 px-1 bg-white/20 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-black/40"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900">Thanh toán</h3>
                    <p className="text-xs font-medium text-gray-500">Xác nhận đơn hàng của {selectedCustId ? custs.find(c => c.id === selectedCustId)?.name : 'Khách vãng lai'}</p>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Phương thức thanh toán</label>
                      <div className="grid grid-cols-2 gap-2">
                        <PayOption 
                          active={payMethod === 'cash'} 
                          onClick={() => setPayMethod('cash')} 
                          icon={Banknote} 
                          label="Tiền mặt" 
                        />
                        <PayOption 
                          active={payMethod === 'transfer'} 
                          onClick={() => setPayMethod('transfer')} 
                          icon={Wallet} 
                          label="Chuyển khoản" 
                        />
                        <PayOption 
                          active={payMethod === 'momo'} 
                          onClick={() => setPayMethod('momo')} 
                          icon={Smartphone} 
                          label="MoMo / App" 
                        />
                        <PayOption 
                          active={payMethod === 'card'} 
                          onClick={() => setPayMethod('card')} 
                          icon={CreditCard} 
                          label="Cà thẻ" 
                        />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Ghi chú thêm</label>
                    <textarea 
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent min-h-[60px]"
                    />
                   </div>
                </div>

                <div className="bg-accent-light px-5 py-4 rounded-2xl border border-accent/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-accent">Thực thu</span>
                    <span className="text-2xl font-black text-accent">{fmt(total)}</span>
                  </div>
                </div>

                <button 
                  onClick={confirmPay}
                  className="w-full py-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-2xl transition-all shadow-xl shadow-accent/20"
                >
                  Hoàn tất đơn hàng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isDoneOpen && lastOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[101] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-emerald-50">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-900">Thanh toán xong!</h3>
                <p className="text-sm text-gray-500 font-medium">Hoá đơn đã được tạo thành công.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-1 items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã hoá đơn</span>
                <span className="text-sm font-mono font-bold text-accent">{lastOrder.id}</span>
                <div className="text-xl font-black text-emerald-700 mt-1">{fmt(lastOrder.total)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setIsDoneOpen(false)} className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">Đóng</button>
                <button 
                  onClick={() => {
                    setIsDoneOpen(false);
                    // In real app, build a proper PDF/Print view
                    window.print();
                  }} 
                  className="py-3 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all hover:bg-accent-dark"
                >
                  In hoá đơn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
      )}
    >
      {label}
    </button>
  );
}

function PayOption({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
        active ? "bg-accent-light border-accent text-accent ring-2 ring-accent/5" : "bg-white border-gray-50 text-gray-500 hover:bg-gray-50"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
