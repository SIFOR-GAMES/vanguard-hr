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
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 dark:bg-[#141210]/95 backdrop-blur-md border-b border-[#E7DEC8] dark:border-[#2E2822] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: Mobile hamburger & Royal Letterhead Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#F2ECE1] dark:hover:bg-stone-800"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E7DEC8] dark:border-[#383129] shadow-xs flex items-center justify-center">
                <RoyalEmblem size="sm" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                    Office of H.H. Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#9E7A36] dark:text-[#D4AF37]">
                    HR System
                  </span>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <span className="font-arabic text-[12px] sm:text-xs text-stone-600 dark:text-stone-400 font-medium" dir="rtl">
                    مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Simplified Search Bar */}
          <div className="flex-1 max-w-sm mx-2 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search personnel, ID, visa, passport..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-[#1C1917] border border-[#E7DEC8] dark:border-[#383129] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA9547] text-stone-900 dark:text-stone-100 placeholder-stone-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions & User Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 rounded-xl hover:bg-[#F2ECE1] dark:hover:bg-stone-800 transition"
              title={darkMode ? 'Switch to Light Stationery Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-[#846429]" />}
            </button>

            {/* Data & Backup Tools Dropdown */}
            <div className="relative" ref={dataDropdownRef}>
              <button
                onClick={() => setDataDropdownOpen(!dataDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-[#1C1917] hover:bg-[#F8F5EE] dark:hover:bg-stone-800 rounded-xl transition border border-[#E7DEC8] dark:border-[#383129]"
                title="Data Options"
              >
                <span>Backup</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {dataDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1C1917] rounded-xl shadow-xl border border-[#E7DEC8] dark:border-[#383129] py-1.5 z-40 text-xs">
                  <button
                    onClick={() => {
                      setDataDropdownOpen(false);
                      onExportBackup();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 dark:text-stone-200 hover:bg-[#F8F5EE] dark:hover:bg-stone-800 text-left transition"
                  >
                    <Download className="w-3.5 h-3.5 text-[#BA9547]" />
                    <span>Export JSON Backup</span>
                  </button>
                  <button
                    onClick={() => {
                      setDataDropdownOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 dark:text-stone-200 hover:bg-[#F8F5EE] dark:hover:bg-stone-800 text-left transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Import JSON Backup</span>
                  </button>
                  <div className="border-t border-[#E7DEC8] dark:border-[#2E2822] my-1" />
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
                  className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white dark:bg-[#1C1917] hover:bg-[#F8F5EE] dark:hover:bg-stone-800 border border-[#E7DEC8] dark:border-[#383129] transition"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#BA9547]/40"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-stone-900 dark:text-white leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-[#A17D34] dark:text-[#D4AF37] font-semibold">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1C1917] rounded-2xl shadow-2xl border border-[#E7DEC8] dark:border-[#383129] p-2 z-40">
                    <div className="px-3 py-2 border-b border-[#E7DEC8] dark:border-[#2E2822]">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                        Active Profile
                      </p>
                      <p className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {currentUser.email}
                      </p>
                      <div className="mt-1.5">
                        <Badge variant="primary" size="sm">
                          {currentUser.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2 pb-1">
                      <p className="px-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
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
                              ? 'bg-[#FBF8F0] dark:bg-[#2A2318] text-[#846429] dark:text-[#E2C687] font-bold border border-[#ECDDBA] dark:border-[#5A451F]'
                              : 'text-stone-700 dark:text-stone-300 hover:bg-[#F8F5EE] dark:hover:bg-stone-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#BA9547]" />
                            {r}
                          </span>
                          {currentUser.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-[#BA9547]" />}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-[#E7DEC8] dark:border-[#2E2822] pt-1 mt-1">
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
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#BA9547] hover:bg-[#A17D34] active:scale-95 rounded-xl shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

