import React, { useState } from 'react';
import { Sparkle, Store, ChevronRight } from 'lucide-react';
import { User, IndustryType } from '../lib/types';
import { INDUSTRY_LABELS } from '../constants';
import { cn, uid } from '../lib/utils';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [industry, setIndustry] = useState<IndustryType>('nail');
  const [shop, setShop] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!shop.trim()) {
      setError('Vui lòng nhập tên tiệm của bạn');
      return;
    }

    const newUser: User = { 
      id: uid(), 
      email: 'user@beautypro.local', 
      pass: 'none', 
      shop: shop.trim(), 
      industry 
    };

    // Lưu thông tin người dùng duy nhất
    const users = { 'user@beautypro.local': newUser };
    localStorage.setItem('bp_users', JSON.stringify(users));
    localStorage.setItem('bp_session', 'user@beautypro.local');
    
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAF9]">
      {/* Visual Left Side */}
      <div className="hidden lg:flex flex-[1.2] relative bg-accent overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-purple-900 opacity-90" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white max-w-lg"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/30 rotate-12 shadow-2xl">
              <Sparkle className="w-10 h-10 fill-white" />
            </div>
          </div>
          <h1 className="text-6xl font-serif font-bold mb-4 tracking-tight">✦ BeautyPro</h1>
          <p className="text-white/80 text-xl leading-relaxed font-medium mb-12">
            Giải pháp quản lý thông minh ✦ Dành cho các cửa hàng làm đẹp hiện đại.
          </p>
          
          <div className="grid grid-cols-3 gap-3">
             <Feature icon="⚡" label="Tối ưu vận hành" />
             <Feature icon="💎" label="Đẳng cấp & Tỉ mỉ" />
             <Feature icon="🎨" label="Sáng tạo không giới hạn" />
          </div>
        </motion.div>
      </div>

      {/* Form Right Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-light text-accent rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkle className="w-3 h-3 fill-current" />
              Bắt đầu ngay trong 30 giây
            </div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">Thiết lập nhanh</h2>
            <p className="text-gray-500 font-medium text-lg">Chào mừng bạn đến với kỷ nguyên quản lý mới.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Tên Salon / Cửa hàng của bạn</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  value={shop}
                  onChange={e => setShop(e.target.value)}
                  placeholder="Ví dụ: My Beauty Salon..." 
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-base font-bold shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Bạn đang kinh doanh lĩnh vực nào?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(INDUSTRY_LABELS) as IndustryType[]).map(key => (
                  <button
                    key={key}
                    onClick={() => setIndustry(key)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-2 group",
                      industry === key ? "bg-accent-light border-accent text-accent ring-4 ring-accent/5" : "bg-white border-gray-50 hover:border-gray-200 grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                    )}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {INDUSTRY_LABELS[key].emoji}
                    </span>
                    <span className="text-[10px] font-black truncate w-full text-center uppercase tracking-tighter">
                       {INDUSTRY_LABELS[key].text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-2"
              >
                <span className="text-lg">⚠️</span>
                {error}
              </motion.div>
            )}

            <button 
              onClick={handleStart}
              className="w-full bg-accent hover:bg-accent-dark text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 text-lg group active:scale-[0.98]"
            >
              Bắt đầu quản lý ngay
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400 font-medium">BeautyPro v2.0 • Được tin dùng bởi +1000 chủ salon</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: string, label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center flex flex-col items-center gap-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">{label}</span>
    </div>
  );
}
