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
  hideDesktop?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  expiringDocsCount,
  hideDesktop = false,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Office Dashboard',
      icon: LayoutDashboard,
      description: 'Operations, analytics & alerts',
    },
    {
      id: 'employees' as ActiveTab,
      label: 'Personnel Directory',
      icon: Users2,
      badge: undefined,
      description: 'Individual dossiers & staff records',
      highlight: true,
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
      description: 'Activity & security log',
    },
  ];

  const content = (
    <div className="flex flex-col h-full py-5">
      {/* Navigation Label */}
      <div className="px-5 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Main Navigation
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-[#088450] text-white shadow-md shadow-[#088450]/20'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg transition ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-[#088450] dark:text-[#34D399] group-hover:bg-slate-100 dark:group-hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.label}</span>
                    {item.highlight && !isActive && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#088450]" />
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate font-normal mt-0.5 ${
                      isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
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
                      ? 'bg-white text-[#088450]'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
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
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#846429] dark:text-[#E2C687] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  Compliance Action
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  {expiringDocsCount} document(s) expiring within 60 days.
                </p>
                <button
                  onClick={() => {
                    onSelectTab('compliance');
                    onCloseMobile();
                  }}
                  className="mt-2 text-[11px] font-bold text-[#846429] dark:text-[#E2C687] hover:underline flex items-center gap-1"
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
      <div className="px-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
        <p className="font-serif font-bold text-slate-800 dark:text-slate-200">Office of H.H. Sh. Zayed Bin Hazza</p>
        <p className="text-[10px] text-[#088450] dark:text-[#34D399] font-medium mt-0.5">HR Operations System</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      {!hideDesktop && (
        <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200/80 bg-white">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
            {content}
          </div>
        </aside>
      )}

      {/* Mobile Drawer (Off-canvas) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-10 flex flex-col border-r border-slate-200/80">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-slate-900">
                HR Navigation
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

