/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  History, 
  Calendar, 
  Users, 
  Settings, 
  LineChart,
  LogOut,
  Sparkle
} from 'lucide-react';
import { User, IndustryType } from './lib/types';
import { INDUSTRY_LABELS } from './constants';
import { cn } from './lib/utils';

// Pages
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Orders from './components/Orders';
import Schedule from './components/Schedule';
import Customers from './components/Customers';
import Services from './components/Services';
import Stats from './components/Stats';
import Auth from './components/Auth';

export type NavPath = 'dashboard' | 'billing' | 'orders' | 'schedule' | 'customers' | 'services' | 'stats';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [path, setPath] = useState<NavPath>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('bp_session');
    if (session) {
      const users = JSON.parse(localStorage.getItem('bp_users') || '{}');
      const u = users[session];
      if (u) setUser(u);
    }
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bp_session');
    setUser(null);
  };

  if (!isLoaded) return null;

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const renderPage = () => {
    switch (path) {
      case 'dashboard': return <Dashboard user={user} setPath={setPath} />;
      case 'billing': return <Billing user={user} />;
      case 'orders': return <Orders user={user} />;
      case 'schedule': return <Schedule user={user} />;
      case 'customers': return <Customers user={user} />;
      case 'services': return <Services user={user} />;
      case 'stats': return <Stats user={user} />;
      default: return <Dashboard user={user} setPath={setPath} />;
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen z-50">
        <div className="p-6 border-bottom border-gray-100">
          <div className="flex items-center gap-2 text-accent font-bold text-2xl mb-1">
            <Sparkle className="w-6 h-6 fill-current" />
            <span>BeautyPro</span>
          </div>
          <div className="text-xs text-gray-400 font-medium truncate">{user.shop}</div>
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-accent-light text-accent text-[10px] font-bold uppercase tracking-wider">
            {INDUSTRY_LABELS[user.industry]?.emoji} {INDUSTRY_LABELS[user.industry]?.text || 'Làm đẹp'}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main</div>
          <NavItem active={path === 'dashboard'} onClick={() => setPath('dashboard')} icon={LayoutDashboard} label="Tổng quan" />
          <NavItem active={path === 'billing'} onClick={() => setPath('billing')} icon={Receipt} label="Tính tiền" />
          <NavItem active={path === 'orders'} onClick={() => setPath('orders')} icon={History} label="Hoá đơn" />
          <NavItem active={path === 'schedule'} onClick={() => setPath('schedule')} icon={Calendar} label="Lịch hẹn" />
          <NavItem active={path === 'customers'} onClick={() => setPath('customers')} icon={Users} label="Khách hàng" />
          
          <div className="px-3 mt-6 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settings</div>
          <NavItem active={path === 'services'} onClick={() => setPath('services')} icon={Settings} label="Dịch vụ & Combo" />
          <NavItem active={path === 'stats'} onClick={() => setPath('stats')} icon={LineChart} label="Thống kê" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-rose-brand flex items-center justify-center text-white font-bold text-lg">
              {user.shop[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.shop}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 flex justify-around items-center z-50">
        <MobileNavItem active={path === 'dashboard'} onClick={() => setPath('dashboard')} icon={LayoutDashboard} label="Q.Lý" />
        <MobileNavItem active={path === 'billing'} onClick={() => setPath('billing')} icon={Receipt} label="Bán hàng" />
        <MobileNavItem active={path === 'schedule'} onClick={() => setPath('schedule')} icon={Calendar} label="Lịch" />
        <MobileNavItem active={path === 'customers'} onClick={() => setPath('customers')} icon={Users} label="Khách" />
        <MobileNavItem active={path === 'stats'} onClick={() => setPath('stats')} icon={LineChart} label="K.Doanh" />
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0 min-w-0 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "nav-item w-full",
        active && "nav-item-active"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-accent" : "text-gray-400")} />
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
    </button>
  );
}

function MobileNavItem({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
        active ? "text-accent" : "text-gray-400 font-medium"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
