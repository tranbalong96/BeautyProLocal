import React, { useState, useMemo, useEffect } from 'react';
import { User, Customer } from '../lib/types';
import { fmt, fmtDate, uid, cn } from '../lib/utils';
import { Search, Plus, UserCircle, Phone, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomersProps {
  user: User;
}

export default function Customers({ user }: CustomersProps) {
  const [custs, setCusts] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setCusts(JSON.parse(localStorage.getItem(`bp_customers_${user.id}`) || '[]'));
  }, [user.id]);

  const filtered = custs.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const saveCust = () => {
    if (!name) return;
    let next = [...custs];
    if (editId) {
      next = next.map(c => c.id === editId ? { ...c, name, phone, dob, note } : c);
    } else {
      next.push({ id: uid(), name, phone, dob, note, totalOrders: 0, totalSpent: 0, lastVisit: '' });
    }
    setCusts(next);
    localStorage.setItem(`bp_customers_${user.id}`, JSON.stringify(next));
    closeModal();
  };

  const deleteCust = (id: string) => {
    if (!confirm('Xoá khách hàng này?')) return;
    const next = custs.filter(c => c.id !== id);
    setCusts(next);
    localStorage.setItem(`bp_customers_${user.id}`, JSON.stringify(next));
    if (editId === id) closeModal();
  };

  const openModal = (c?: Customer) => {
    if (c) {
      setEditId(c.id); setName(c.name); setPhone(c.phone); setDob(c.dob); setNote(c.note);
    } else {
      setEditId(null); setName(''); setPhone(''); setDob(''); setNote('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Danh sách khách hàng</h2>
          <p className="text-sm font-medium text-gray-500">Quản lý cơ sở dữ liệu khách hàng thân thiết.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              placeholder="Tìm tên hoặc SĐT..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-accent text-sm w-full sm:w-64"
            />
          </div>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="w-4 h-4" /> Thêm khách hàng
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-10 -mt-10" />
            
            <button onClick={() => openModal(c)} className="relative z-10 w-full p-6 text-left touch-manipulation" type="button">
              <div className="flex items-start justify-between mb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-accent-light flex items-center justify-center text-accent font-black text-xl">
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight truncate">{c.name}</h3>
                    <p className="text-xs text-gray-400 font-bold tracking-tight uppercase truncate">{c.phone || 'Chưa cập nhật SĐT'}</p>
                  </div>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
                  <Pencil className="h-4 w-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-xl text-center">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Tổng đơn</div>
                  <div className="text-sm font-black text-gray-700">{c.totalOrders || 0}</div>
                </div>
                <div className="p-2 bg-accent/5 rounded-xl text-center">
                  <div className="text-[9px] font-black text-accent/60 uppercase tracking-widest leading-none mb-1">Tổng chi</div>
                  <div className="text-sm font-black text-accent">{fmt(c.totalSpent || 0)}</div>
                </div>
              </div>

              {c.note && (
                <div className="bg-amber-50/50 border border-amber-100/50 p-3 rounded-xl">
                  <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Ghi chú</div>
                  <p className="text-xs text-amber-700 font-medium line-clamp-2 italic">{c.note}</p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400">
                <span className="uppercase tracking-widest">Lần cuối: {c.lastVisit ? fmtDate(c.lastVisit) : 'Mới'}</span>
                {c.dob && (
                  <span className="text-rose-400 flex items-center gap-1 uppercase tracking-widest">
                    🎂 {new Date(c.dob).toLocaleDateString('vi-VN', {day:'numeric', month:'short'})}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => deleteCust(c.id)}
              className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm ring-1 ring-gray-100 hover:bg-rose-50 hover:text-rose-500"
              type="button"
              aria-label={`Xoá ${c.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-sm overflow-hidden p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold">{editId ? 'Sửa thông tin' : 'Thêm khách hàng'}</h3>
                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tên khách</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Thị A" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent text-sm font-medium"/></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SĐT</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="090..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent text-sm font-medium"/></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngày sinh</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent text-sm font-medium"/></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ghi chú</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent text-sm font-medium min-h-[60px]"/></div>
              </div>
              <div className="space-y-3">
                <button onClick={saveCust} className="w-full py-4 bg-accent text-white font-bold rounded-2xl shadow-xl shadow-accent/20">{editId ? 'Lưu thay đổi' : 'Tạo mới'}</button>
                {editId && (
                  <button
                    onClick={() => deleteCust(editId)}
                    className="w-full py-3 border border-rose-100 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xoá khách hàng
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
