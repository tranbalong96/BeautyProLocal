import React, { useState, useEffect } from 'react';
import { User, Service, ServiceGroup } from '../lib/types';
import { fmt, uid, cn } from '../lib/utils';
import { loadServiceGroups, saveServiceGroups } from '../lib/services';
import { Plus, Pencil, Trash2, X, Tag, Clock, FolderOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesProps {
  user: User;
}

export default function Services({ user }: ServicesProps) {
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [modal, setModal] = useState<'group' | 'service' | null>(null);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editServiceId, setEditServiceId] = useState<string | null>(null);

  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [serviceGroupId, setServiceGroupId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [dur, setDur] = useState(0);
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const next = loadServiceGroups(user.id);
    setGroups(next);
    setSelectedGroupId(current => current || next[0]?.id || '');
  }, [user.id]);

  const selectedGroup = groups.find(group => group.id === selectedGroupId) || groups[0];
  const totalServices = groups.reduce((sum, group) => sum + group.services.length, 0);
  const countText = `${groups.length} gói lớn • ${totalServices} dịch vụ con`;

  const persist = (next: ServiceGroup[]) => {
    setGroups(next);
    saveServiceGroups(user.id, next);
    if (!next.some(group => group.id === selectedGroupId)) {
      setSelectedGroupId(next[0]?.id || '');
    }
  };

  const openGroupModal = (group?: ServiceGroup) => {
    if (group) {
      setEditGroupId(group.id);
      setGroupName(group.name);
      setGroupDesc(group.desc);
    } else {
      setEditGroupId(null);
      setGroupName('');
      setGroupDesc('');
    }
    setModal('group');
  };

  const openServiceModal = (service?: Service) => {
    if (!selectedGroup) return;
    if (service) {
      setEditServiceId(service.id);
      setServiceGroupId(service.groupId || selectedGroup.id);
      setName(service.name);
      setPrice(service.price);
      setDur(service.dur);
      setDesc(service.desc);
    } else {
      setEditServiceId(null);
      setServiceGroupId(selectedGroup.id);
      setName('');
      setPrice(0);
      setDur(0);
      setDesc('');
    }
    setModal('service');
  };

  const closeModal = () => {
    setModal(null);
    setEditGroupId(null);
    setEditServiceId(null);
    setServiceGroupId('');
  };

  const saveGroup = () => {
    if (!groupName.trim()) return;
    let next: ServiceGroup[];
    if (editGroupId) {
      next = groups.map(group =>
        group.id === editGroupId ? { ...group, name: groupName.trim(), desc: groupDesc.trim() } : group
      );
    } else {
      const id = uid();
      next = [...groups, { id, name: groupName.trim(), desc: groupDesc.trim(), services: [] }];
      setSelectedGroupId(id);
    }
    persist(next);
    closeModal();
  };

  const deleteGroup = (id: string) => {
    const group = groups.find(item => item.id === id);
    if (!group) return;
    if (!confirm(`Xoá gói "${group.name}" và toàn bộ dịch vụ con bên trong?`)) return;
    persist(groups.filter(item => item.id !== id));
  };

  const saveService = () => {
    const targetGroup = groups.find(group => group.id === serviceGroupId);
    if (!targetGroup || !name.trim() || price <= 0) return;
    const service: Service = {
      id: editServiceId || uid(),
      name: name.trim(),
      type: 'service',
      groupId: targetGroup.id,
      groupName: targetGroup.name,
      price,
      dur,
      desc: desc.trim(),
    };
    const next = groups.map(group => {
      const servicesWithoutEdited = editServiceId
        ? group.services.filter(item => item.id !== editServiceId)
        : group.services;
      if (group.id !== targetGroup.id) {
        return { ...group, services: servicesWithoutEdited };
      }
      return {
        ...group,
        services: [...servicesWithoutEdited, service],
      };
    });
    setSelectedGroupId(targetGroup.id);
    persist(next);
    closeModal();
  };

  const deleteService = (id: string) => {
    if (!selectedGroup || !confirm('Xoá dịch vụ này khỏi gói?')) return;
    persist(groups.map(group =>
      group.id === selectedGroup.id
        ? { ...group, services: group.services.filter(item => item.id !== id) }
        : group
    ));
  };

  return (
    <div className="space-y-6">
      <header className="sticky top-0 -mx-4 -mt-4 bg-[#FAFAF9]/95 px-4 pt-4 pb-3 backdrop-blur lg:static lg:m-0 lg:bg-transparent lg:p-0 z-30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Gói & Dịch vụ</h2>
            <p className="text-sm font-medium text-gray-500">Quản lý gói lớn, bấm vào gói để thêm dịch vụ con.</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">{countText}</p>
          </div>
          <button onClick={() => openGroupModal()} className="btn-primary shrink-0 px-3 sm:px-4">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm gói lớn</span>
            <span className="sm:hidden">Gói</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-gray-900">
              <FolderOpen className="h-5 w-5 text-accent" />
              Gói dịch vụ lớn
            </h3>
            <button onClick={() => openGroupModal()} className="btn-outline px-3 py-2 text-xs">
              <Plus className="h-4 w-4" />
              Thêm
            </button>
          </div>

          <div className="space-y-3">
            {groups.length > 0 ? groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                active={group.id === selectedGroup?.id}
                onSelect={() => setSelectedGroupId(group.id)}
                onEdit={() => openGroupModal(group)}
                onDelete={() => deleteGroup(group.id)}
              />
            )) : (
              <EmptyState
                title="Chưa có gói dịch vụ lớn."
                action="Tạo gói đầu tiên"
                onAdd={() => openGroupModal()}
              />
            )}
          </div>
        </section>

        <section className="space-y-4">
          {selectedGroup ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xl font-serif font-bold text-gray-900">{selectedGroup.name}</h3>
                  <p className="text-sm font-medium text-gray-500">{selectedGroup.desc || 'Chưa có mô tả cho gói này.'}</p>
                </div>
                <button onClick={() => openServiceModal()} className="btn-primary shrink-0 px-3 sm:px-4">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Thêm dịch vụ con</span>
                  <span className="sm:hidden">Dịch vụ</span>
                </button>
              </div>

              <div className="space-y-3">
                {selectedGroup.services.length > 0 ? selectedGroup.services.map(service => (
                  <SvcItem key={service.id} s={service} onEdit={openServiceModal} onDelete={deleteService} />
                )) : (
                  <EmptyState
                    title="Gói này chưa có dịch vụ con."
                    action="Thêm dịch vụ con"
                    onAdd={() => openServiceModal()}
                  />
                )}
              </div>
            </>
          ) : (
            <EmptyState
              title="Tạo gói lớn trước, sau đó thêm dịch vụ con vào bên trong."
              action="Tạo gói lớn"
              onAdd={() => openGroupModal()}
            />
          )}
        </section>
      </div>

      {selectedGroup && (
        <button
          onClick={() => openServiceModal()}
          className="lg:hidden fixed right-4 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-2xl shadow-accent/30 active:scale-95"
          aria-label="Thêm dịch vụ con"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold">
                  {modal === 'group' ? (editGroupId ? 'Sửa gói lớn' : 'Thêm gói lớn') : (editServiceId ? 'Sửa dịch vụ con' : 'Thêm dịch vụ con')}
                </h3>
                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              {modal === 'group' ? (
                <div className="space-y-4">
                  <Field label="Tên gói lớn">
                    <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Ví dụ: Chăm sóc móng" className="input-field" />
                  </Field>
                  <Field label="Mô tả">
                    <textarea value={groupDesc} onChange={e => setGroupDesc(e.target.value)} placeholder="Các dịch vụ nằm trong nhóm này..." className="input-field min-h-[80px]" />
                  </Field>
                  <button onClick={saveGroup} className="w-full py-4 bg-accent text-white font-bold rounded-2xl shadow-xl shadow-accent/20 transition-all hover:bg-accent-dark active:scale-[0.98]">
                    {editGroupId ? 'Lưu gói lớn' : 'Tạo gói lớn'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Thuộc gói lớn">
                    <select value={serviceGroupId} onChange={e => setServiceGroupId(e.target.value)} className="input-field">
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tên dịch vụ con">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Sơn gel tay" className="input-field" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Giá (đ)">
                      <input type="number" value={price || ''} onChange={e => setPrice(parseFloat(e.target.value) || 0)} placeholder="0" className="input-field text-accent" />
                    </Field>
                    <Field label="Thời gian (phút)">
                      <input type="number" value={dur || ''} onChange={e => setDur(parseInt(e.target.value) || 0)} placeholder="60" className="input-field" />
                    </Field>
                  </div>
                  <Field label="Mô tả ngắn">
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="..." className="input-field min-h-[70px]" />
                  </Field>
                  <button onClick={saveService} className="w-full py-4 bg-accent text-white font-bold rounded-2xl shadow-xl shadow-accent/20 transition-all hover:bg-accent-dark active:scale-[0.98]">
                    {editServiceId ? 'Lưu dịch vụ' : 'Thêm vào gói'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GroupCard({ group, active, onSelect, onEdit, onDelete }: { group: ServiceGroup, active: boolean, onSelect: () => void, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-2xl border bg-white p-3 shadow-sm transition-all", active ? "border-accent ring-4 ring-accent/5" : "border-gray-100 hover:border-gray-200")}>
      <button onClick={onSelect} className="flex min-h-[72px] min-w-0 flex-1 touch-manipulation items-center gap-3 text-left" type="button">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", active ? "bg-accent text-white" : "bg-accent-light text-accent")}>
          <Tag className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-bold text-gray-900">{group.name}</h4>
          <p className="line-clamp-1 text-xs font-medium text-gray-500">{group.desc || 'Chưa có mô tả'}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">{group.services.length} dịch vụ con</p>
        </div>
        <ChevronRight className={cn("h-4 w-4 shrink-0", active ? "text-accent" : "text-gray-300")} />
      </button>
      <button onClick={onEdit} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-accent-light hover:text-accent" type="button" aria-label={`Sửa ${group.name}`}>
        <Pencil className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-500" type="button" aria-label={`Xoá ${group.name}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function SvcItem({ s, onEdit, onDelete }: { s: Service, onEdit: (s: Service) => void, onDelete: (id: string) => void }) {
  return (
    <div className="group flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-accent/20 hover:shadow-md">
      <button onClick={() => onEdit(s)} className="flex min-h-[64px] min-w-0 flex-1 touch-manipulation select-none items-center justify-between gap-3 rounded-xl px-1 text-left active:scale-[0.99]" type="button" aria-label={`Sửa ${s.name}`}>
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
      <button onClick={() => onDelete(s.id)} className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500 active:bg-rose-50" type="button" aria-label={`Xoá ${s.name}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ title, action, onAdd }: { title: string, action: string, onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-6 text-center">
      <p className="mb-3 text-xs font-medium italic text-gray-400">{title}</p>
      <button onClick={onAdd} className="btn-outline mx-auto text-xs">
        <Plus className="h-4 w-4" />
        {action}
      </button>
    </div>
  );
}
