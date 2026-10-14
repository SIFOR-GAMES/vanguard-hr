import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  ChevronDown, 
  Download, 
  Upload, 
  RotateCcw,
  Menu,
  CheckCircle2
} from 'lucide-react';
import { User, UserRole } from '../../types/hr';
import { Badge } from './Badge';
import { RoyalEmblem } from './RoyalEmblem';

interface NavbarProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileSidebar: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  onResetData: () => void;
  activeTab?: 'dashboard' | 'employees' | 'compliance' | 'payroll' | 'audit';
  onSelectTab?: (tab: 'dashboard' | 'employees' | 'compliance' | 'payroll' | 'audit') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onSwitchRole,
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  onToggleMobileSidebar,
  onExportBackup,
  onImportBackup,
  onResetData,
  activeTab = 'dashboard',
  onSelectTab,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [dataDropdownOpen, setDataDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const dataDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (dataDropdownRef.current && !dataDropdownRef.current.contains(event.target as Node)) {
        setDataDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: UserRole[] = ['Super Admin', 'HR Manager', 'Payroll Officer', 'Auditor'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportBackup(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: Mobile hamburger & Royal Letterhead Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center">
                <RoyalEmblem size="sm" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                    Office of H.H. Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1E683E] dark:text-[#34D399]">
                    HR System
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="font-arabic text-[12px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium" dir="rtl">
                    مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Simplified Search Bar */}
          <div className="flex-1 max-w-sm mx-2 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search personnel, ID, visa, passport..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E683E] text-slate-900 dark:text-slate-100 placeholder-slate-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions & User Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* u.ae Style Language Button */}
            <div className="hidden sm:flex items-center">
              <span className="px-2.5 py-1 text-xs font-arabic font-bold text-[#1E683E] dark:text-[#34D399] bg-[#EBF5EF] dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800/80 cursor-default">
                العربية
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#BA9547]" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Data & Backup Tools Dropdown */}
            <div className="relative" ref={dataDropdownRef}>
              <button
                onClick={() => setDataDropdownOpen(!dataDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition border border-slate-200 dark:border-slate-700 shadow-xs"
                title="Data Options"
              >
                <span>Backup</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {dataDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 text-xs">
                  <button
                    onClick={() => {
                      setDataDropdownOpen(false);
                      onExportBackup();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition"
                  >
                    <Download className="w-3.5 h-3.5 text-[#1E683E]" />
                    <span>Export JSON Backup</span>
                  </button>
                  <button
                    onClick={() => {
                      setDataDropdownOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#1E683E]" />
                    <span>Import JSON Backup</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                  <button
                    onClick={() => {
                      setDataDropdownOpen(false);
                      if (confirm('Reset system to default seed data? All custom additions will be restored.')) {
                        onResetData();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Seed Data</span>
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            {/* Current User & Role Switcher */}
            {currentUser ? (
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#1E683E]/40"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-[#1E683E] dark:text-[#34D399] font-bold">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-40">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Active Profile
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {currentUser.email}
                      </p>
                      <div className="mt-1.5">
                        <Badge variant="primary" size="sm">
                          {currentUser.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2 pb-1">
                      <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Switch Role
                      </p>
                      {roles.map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            onSwitchRole(r);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition ${
                            currentUser.role === r
                              ? 'bg-[#EBF5EF] dark:bg-emerald-950/60 text-[#1E683E] dark:text-[#34D399] font-bold border border-emerald-200 dark:border-emerald-800'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#1E683E]" />
                            {r}
                          </span>
                          {currentUser.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-[#1E683E]" />}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#1E683E] hover:bg-[#165130] active:scale-95 rounded-xl shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* u.ae Horizontal Navigation Sub-bar */}
      <div className="border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#0F172A]/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 text-xs sm:text-sm font-semibold">
            {[
              { id: 'dashboard', label: 'Home' },
              { id: 'employees', label: 'Personnel Directory' },
              { id: 'compliance', label: 'Compliance Radar' },
              { id: 'payroll', label: 'Payroll & Wages' },
              { id: 'audit', label: 'Audit Timeline' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab && onSelectTab(item.id as any)}
                  className={`py-3.5 border-b-2 font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'border-[#1E683E] text-[#1E683E] dark:text-[#34D399] dark:border-[#34D399]'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

