import React from 'react';
import { 
  LayoutDashboard, 
  Users2, 
  FileCheck2, 
  WalletCards, 
  History, 
  ShieldAlert,
  ChevronRight,
  X
} from 'lucide-react';
import { UserRole } from '../../types/hr';

export type ActiveTab = 'dashboard' | 'employees' | 'compliance' | 'payroll' | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  userRole?: UserRole;
  expiringDocsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  expiringDocsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'HR Dashboard',
      icon: LayoutDashboard,
      description: 'Overview, analytics & alerts',
    },
    {
      id: 'employees' as ActiveTab,
      label: 'Employee Directory',
      icon: Users2,
      badge: undefined,
      description: 'Individual files & digital dossiers',
      highlight: true, // Specifically highlighted as required
    },
    {
      id: 'compliance' as ActiveTab,
      label: 'Document Compliance',
      icon: FileCheck2,
      badge: expiringDocsCount > 0 ? `${expiringDocsCount} Alert${expiringDocsCount > 1 ? 's' : ''}` : undefined,
      badgeColor: 'rose',
      description: 'Passports, Visas & Labor permits',
    },
    {
      id: 'payroll' as ActiveTab,
      label: 'Salary & Payroll',
      icon: WalletCards,
      description: 'Cash vs Bank payment ledger',
    },
    {
      id: 'audit' as ActiveTab,
      label: 'System Audit Trail',
      icon: History,
      description: 'Immutable security event log',
    },
  ];

  const content = (
    <div className="flex flex-col h-full py-4">
      {/* Navigation Label */}
      <div className="px-4 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main HR Navigation
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg transition ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.label}</span>
                    {item.highlight && !isActive && (
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate font-normal mt-0.5 ${
                      isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Expiry Warning Callout */}
      {expiringDocsCount > 0 && (
        <div className="px-3 pt-3">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Compliance Warning
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  {expiringDocsCount} document(s) expiring within 60 days require immediate renewal.
                </p>
                <button
                  onClick={() => {
                    onSelectTab('compliance');
                    onCloseMobile();
                  }}
                  className="mt-2 text-[11px] font-bold text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1"
                >
                  Review documents
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Vanguard HR v1.0</p>
        <p>Deployed on 9pm.ai Platform</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer (Off-canvas) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-10 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                Vanguard HR Menu
              </span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
