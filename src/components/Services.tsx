import React, { useState, useEffect } from 'react';
import { User, Service } from '../lib/types';
import { fmt, uid, cn } from '../lib/utils';
import { Plus, Pencil, Trash2, X, Tag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesProps {
  user: User;
}

export default function Services({ user }: ServicesProps) {
  const [svcs, setSvcs] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<'service' | 'combo'>('service');
  const [price, setPrice] = useState(0);
  const [dur, setDur] = useState(0);
  const [desc, setDesc] = useState('');

  useEffect(() => {
    setSvcs(JSON.parse(localStorage.getItem(`bp_services_${user.id}`) || '[]'));
  }, [user.id]);

  const saveSvc = () => {
    if (!name || price <= 0) return;
    let next = [...svcs];
    if (editId) {
      next = next.map(s => s.id === editId ? { ...s, name, type, price, dur, desc } : s);
    } else {
      next.push({ id: uid(), name, type, price, dur, desc });
    }
    setSvcs(next);
    localStorage.setItem(`bp_services_${user.id}`, JSON.stringify(next));
    closeModal();
  };

  const deleteSvc = (id: string) => {
    if (!confirm('Xoá dịch vụ này khỏi menu?')) return;
    const next = svcs.filter(s => s.id !== id);
    setSvcs(next);
    localStorage.setItem(`bp_services_${user.id}`, JSON.stringify(next));
  };

  const openModal = (s?: Service) => {
    if (s) {
      setEditId(s.id); setName(s.name); setType(s.type); setPrice(s.price); setDur(s.dur); setDesc(s.desc);
    } else {
      setEditId(null); setName(''); setType('service'); setPrice(0); setDur(0); setDesc('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditId(null);
  };

  const singles = svcs.filter(s => s.type === 'service');
  const combos = svcs.filter(s => s.type === 'combo');

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Bảng giá Dịch vụ</h2>
          <p className="text-sm font-medium text-gray-500">Thiết lập menu và combo ưu đãi.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Thêm dịch vụ/gói mới
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-accent" />
            <h3 className="text-lg font-serif font-bold text-gray-900">Dịch vụ đơn lẻ</h3>
          </div>
          <div className="space-y-3">
            {singles.length > 0 ? singles.map(s => <SvcItem key={s.id} s={s} onEdit={openModal} onDelete={deleteSvc} />) : <EmptyState />}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-rose-brand" />
            <h3 className="text-lg font-serif font-bold text-gray-900">Combo & Gói ưu đãi</h3>
          </div>
          <div className="space-y-3">
            {combos.length > 0 ? combos.map(s => <SvcItem key={s.id} s={s} onEdit={openModal} onDelete={deleteSvc} />) : <EmptyState />}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-sm overflow-hidden p-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold">{editId ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h3>
                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tên dịch vụ</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent text-sm font-bold text-gray-900"/></div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loại</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold">
                      <option value="service" className="font-sans">Dịch vụ đơn</option>
                      <option value="combo" className="font-sans">Combo</option>
                    </select>
                  </div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giá (đ)</label>
                    <input type="number" value={price || ''} onChange={e => setPrice(parseFloat(e.target.value) || 0)} placeholder="0" className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold text-accent"/>
                  </div>
                </div>

                <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thời gian thực hiện (phút)</label>
                <input type="number" value={dur || ''} onChange={e => setDur(parseInt(e.target.value) || 0)} placeholder="60" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent text-sm font-medium"/></div>
                
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mô tả ngắn</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-accent text-sm font-medium min-h-[60px]"/></div>
              </div>
              <button onClick={saveSvc} className="w-full py-4 bg-accent text-white font-bold rounded-2xl shadow-xl shadow-accent/20 transition-all hover:bg-accent-dark active:scale-[0.98]">{editId ? 'Lưu thay đổi' : 'Xác nhận thêm'}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SvcItem({ s, onEdit, onDelete }: { s: Service, onEdit: (s: Service) => void, onDelete: (id: string) => void }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
       <div className="flex-1 min-w-0 pr-4">
         <div className="flex items-center gap-2 mb-0.5">
           <h4 className="font-bold text-gray-900 truncate">{s.name}</h4>
           {s.dur > 0 && <span className="flex items-center gap-0.5 text-[10px] font-bold text-gray-400 uppercase"><Clock className="w-2.5 h-2.5" /> {s.dur}ph</span>}
         </div>
         <p className="text-xs text-gray-500 font-medium line-clamp-1 italic">{s.desc || '— Không có mô tả —'}</p>
       </div>
       <div className="flex items-center gap-3">
         <span className="text-sm font-black text-accent">{fmt(s.price)}</span>
         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => onEdit(s)} className="p-2 text-gray-400 hover:text-accent hover:bg-accent-light rounded-lg"><Pencil className="w-4 h-4" /></button>
           <button onClick={() => onDelete(s.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
         </div>
       </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center text-gray-300 italic text-xs font-medium">Chưa có dịch vụ trong danh mục này.</div>
  );
}
