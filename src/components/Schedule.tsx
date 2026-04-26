import React, { useState, useMemo, useEffect } from 'react';
import { User, Appointment, Customer } from '../lib/types';
import { fmtDate, today, uid, cn } from '../lib/utils';
import { Calendar as CalendarIcon, Clock, Plus, Check, X, Phone, User as UserIcon, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleProps {
  user: User;
}

export default function Schedule({ user }: ScheduleProps) {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [custs, setCusts] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(today());
  const [time, setTime] = useState('09:00');
  const [svc, setSvc] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setAppts(JSON.parse(localStorage.getItem(`bp_appointments_${user.id}`) || '[]'));
    setCusts(JSON.parse(localStorage.getItem(`bp_customers_${user.id}`) || '[]'));
  }, [user.id]);

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return custs.slice(0, 3);
    return custs.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(customerSearch.trim())
    ).slice(0, 3);
  }, [custs, customerSearch]);

  const selectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = custs.find(c => c.id === customerId);
    if (!customer) return;
    setName(customer.name);
    setPhone(customer.phone);
    setCustomerSearch(`${customer.name}${customer.phone ? ` - ${customer.phone}` : ''}`);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomerId('');
    setCustomerSearch('');
    setName('');
    setPhone('');
  };

  const saveAppt = () => {
    if (!name || !date) return;
    const newAppt: Appointment = {
      id: uid(),
      customerId: selectedCustomerId || undefined,
      name,
      phone,
      date,
      time,
      svc,
      note,
      status: 'pending'
    };
    const next = [...appts, newAppt];
    setAppts(next);
    localStorage.setItem(`bp_appointments_${user.id}`, JSON.stringify(next));
    setIsModalOpen(false);
    resetForm();
  };

  const toggleStatus = (id: string) => {
    const next = appts.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'done' ? 'pending' : 'done' as const };
      }
      return a;
    });
    setAppts(next);
    localStorage.setItem(`bp_appointments_${user.id}`, JSON.stringify(next));
  };

  const deleteAppt = (id: string) => {
    if (!confirm('Xoá lịch hẹn này?')) return;
    const next = appts.filter(a => a.id !== id);
    setAppts(next);
    localStorage.setItem(`bp_appointments_${user.id}`, JSON.stringify(next));
  };

  const resetForm = () => {
    setSelectedCustomerId(''); setCustomerSearch(''); setName(''); setPhone(''); setDate(today()); setTime('09:00'); setSvc(''); setNote('');
  };

  const tDate = today();
  const todayAppts = appts.filter(a => a.date === tDate).sort((a,b) => a.time.localeCompare(b.time));
  const upcomingAppts = appts.filter(a => a.date > tDate).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Lịch trình làm việc</h2>
          <p className="text-sm font-medium text-gray-500">Xem và sắp xếp lịch hẹn của khách hàng.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Tạo lịch hẹn mới
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-accent-light rounded-lg">
              <CalendarIcon className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900">Hôm nay</h3>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">{fmtDate(tDate)}</span>
          </div>
          
          <div className="space-y-3">
            {todayAppts.length > 0 ? todayAppts.map(a => (
              <ApptCard key={a.id} a={a} onToggle={toggleStatus} onDelete={deleteAppt} />
            )) : <EmptyState message="Chưa có lịch hẹn nào hôm nay." />}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900">Sắp tới</h3>
          </div>
          
          <div className="space-y-3">
            {upcomingAppts.length > 0 ? upcomingAppts.map(a => (
              <ApptCard key={a.id} a={a} onToggle={toggleStatus} onDelete={deleteAppt} showDate />
            )) : <EmptyState message="Không có lịch hẹn sắp tới." />}
          </div>
        </section>
      </div>

      {/* Appointment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-serif font-bold text-gray-900">Đặt lịch hẹn</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Chọn khách hàng có sẵn</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={customerSearch}
                        onChange={e => {
                          setCustomerSearch(e.target.value);
                          setSelectedCustomerId('');
                        }}
                        placeholder="Tìm tên hoặc SĐT khách..."
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent transition-all text-sm font-medium"
                      />
                      {(customerSearch || selectedCustomerId) && (
                        <button onClick={clearSelectedCustomer} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500" type="button">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {filteredCustomers.length > 0 && !selectedCustomerId && (
                      <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
                        {filteredCustomers.map(c => (
                          <button
                            key={c.id}
                            onClick={() => selectCustomer(c.id)}
                            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent-light"
                            type="button"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-gray-900">{c.name}</span>
                              <span className="block truncate text-[11px] font-medium text-gray-400">{c.phone || 'Chưa có SĐT'}</span>
                            </span>
                            <Plus className="h-4 w-4 shrink-0 text-accent" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Tên khách hàng</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder="Tên khách hàng" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">SĐT liên hệ</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="Số điện thoại" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Ngày hẹn</label>
                      <input 
                        type="date" 
                        value={date} onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Giờ hẹn</label>
                      <input 
                        type="time" 
                        value={time} onChange={e => setTime(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Dịch vụ & Ghi chú</label>
                    <textarea 
                      value={svc} onChange={e => setSvc(e.target.value)}
                      placeholder="Dịch vụ dự định, sở thích khách hàng..." 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent transition-all text-sm font-medium min-h-[80px]"
                    />
                  </div>
                </div>

                <button 
                  onClick={saveAppt}
                  className="w-full py-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-2xl transition-all shadow-xl shadow-accent/20"
                >
                  Xác nhận đặt lịch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApptCard({ a, onToggle, onDelete, showDate = false }: { a: Appointment, onToggle: (id: string) => void, onDelete: (id: string) => void, showDate?: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all flex items-center gap-4 group",
      a.status === 'done' ? "bg-emerald-50/30 border-emerald-100 grayscale-[0.3]" : "bg-white border-gray-100 shadow-sm"
    )}>
      <div className="flex flex-col items-center justify-center min-w-[70px] py-1.5 rounded-xl bg-accent-light text-accent border border-accent/10">
        {showDate && <span className="text-[9px] font-black uppercase leading-tight mb-0.5">{fmtDate(a.date).split('/')[0] + '/' + fmtDate(a.date).split('/')[1]}</span>}
        <span className="text-sm font-black uppercase tracking-tighter leading-none">{a.time}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-base font-bold", a.status === 'done' ? "line-through text-gray-400" : "text-gray-900")}>{a.name}</span>
          {a.status === 'done' && <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-widest">Done</span>}
        </div>
        <div className="text-xs text-gray-500 font-medium truncate flex items-center gap-1.5">
          {a.svc || 'Dịch vụ chưa xếp'}
          {a.phone && <span className="flex items-center gap-0.5 opacity-60"><Phone className="w-2.5 h-2.5" /> {a.phone}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onToggle(a.id)}
          className={cn("p-2 rounded-lg transition-all", a.status === 'done' ? "text-gray-400 hover:text-accent" : "text-emerald-500 hover:bg-emerald-50")}
        >
          <Check className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(a.id)}
          className="p-2 text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center px-6">
      <CalendarIcon className="w-10 h-10 text-gray-200 mb-2" />
      <p className="text-sm text-gray-400 font-medium italic">{message}</p>
    </div>
  );
}
