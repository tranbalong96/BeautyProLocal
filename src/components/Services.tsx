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

  const openModal = (s?: Service, nextType: 'service' | 'combo' = 'service') => {
    if (s) {
      setEditId(s.id); setName(s.name); setType(s.type); setPrice(s.price); setDur(s.dur); setDesc(s.desc);
    } else {
      setEditId(null); setName(''); setType(nextType); setPrice(0); setDur(0); setDesc('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditId(null);
  };

  const singles = svcs.filter(s => s.type === 'service');
  const combos = svcs.filter(s => s.type === 'combo');
  const serviceCountText = `${singles.length} dịch vụ • ${combos.length} combo`;

  return (
    <div className="space-y-6">
      <header className="sticky top-0 -mx-4 -mt-4 bg-[#FAFAF9]/95 px-4 pt-4 pb-3 backdrop-blur lg:static lg:m-0 lg:bg-transparent lg:p-0 z-30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Bảng giá Dịch vụ</h2>
            <p className="text-sm font-medium text-gray-500">Thiết lập menu và combo ưu đãi.</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">{serviceCountText}</p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-primary shrink-0 px-3 sm:px-4"
            aria-label="Thêm dịch vụ hoặc combo mới"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm dịch vụ/gói mới</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-accent" />
            <h3 className="text-lg font-serif font-bold text-gray-900">Dịch vụ đơn lẻ</h3>
          </div>
          <div className="space-y-3">
            {singles.length > 0 ? singles.map(s => <SvcItem key={s.id} s={s} onEdit={openModal} onDelete={deleteSvc} />) : <EmptyState onAdd={() => openModal(undefined, 'service')} label="Thêm dịch vụ đầu tiên" />}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-rose-brand" />
            <h3 className="text-lg font-serif font-bold text-gray-900">Combo & Gói ưu đãi</h3>
          </div>
          <div className="space-y-3">
            {combos.length > 0 ? combos.map(s => <SvcItem key={s.id} s={s} onEdit={openModal} onDelete={deleteSvc} />) : <EmptyState onAdd={() => openModal(undefined, 'combo')} label="Thêm combo đầu tiên" />}
          </div>
        </section>
      </div>

      <button
        onClick={() => openModal()}
        className="lg:hidden fixed right-4 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-2xl shadow-accent/30 active:scale-95"
        aria-label="Thêm dịch vụ hoặc combo mới"
      >
        <Plus className="h-6 w-6" />
      </button>

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
    <div className="group flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-accent/20 hover:shadow-md">
      <button
        onClick={() => onEdit(s)}
        className="flex min-h-[64px] min-w-0 flex-1 touch-manipulation select-none items-center justify-between gap-3 rounded-xl px-1 text-left active:scale-[0.99]"
        type="button"
        aria-label={`Sửa ${s.name}`}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <h4 className="truncate font-bold text-gray-900">{s.name}</h4>
            {s.dur > 0 && <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-bold uppercase text-gray-400"><Clock className="h-2.5 w-2.5" /> {s.dur}ph</span>}
          </div>
          <p className="line-clamp-1 text-xs font-medium italic text-gray-500">{s.desc || '- Không có mô tả -'}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-black text-accent">{fmt(s.price)}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-light text-accent">
            <Pencil className="h-4 w-4" />
          </span>
        </div>
      </button>
      <button
        onClick={() => onDelete(s.id)}
        className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500 active:bg-rose-50"
        type="button"
        aria-label={`Xoá ${s.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function EmptyState({ onAdd, label }: { onAdd: () => void, label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-6 text-center">
      <p className="mb-3 text-xs font-medium italic text-gray-400">Chưa có dịch vụ trong danh mục này.</p>
      <button onClick={onAdd} className="btn-outline mx-auto text-xs">
        <Plus className="h-4 w-4" />
        {label}
      </button>
    </div>
  );
}
