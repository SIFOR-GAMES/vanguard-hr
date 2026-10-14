import React from 'react';
import { RoyalEmblem } from './RoyalEmblem';
import { Shield, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab?: (tab: 'dashboard' | 'employees' | 'compliance' | 'payroll' | 'audit') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-white dark:bg-[#0A0F1D] border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto">
      {/* UAE Flag Accent Stripe */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/4 bg-[#088450]" />
        <div className="h-full w-1/4 bg-white border-y border-slate-200 dark:border-slate-700" />
        <div className="h-full w-1/4 bg-[#0F172A]" />
        <div className="h-full w-1/4 bg-[#D92D20]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Emblem & Entity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <RoyalEmblem size="sm" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                  Office of H.H. Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
                </h3>
                <p className="font-arabic text-xs text-[#1E683E] dark:text-[#34D399] font-bold mt-0.5" dir="rtl">
                  مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Official Human Resources & Personnel Management Portal. Designed in compliance with UAE federal digital standards and Ministry of Human Resources and Emiratisation (MOHRE) guidelines.
            </p>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Portal Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('dashboard')}
                  className="hover:text-[#1E683E] dark:hover:text-[#34D399] transition cursor-pointer"
                >
                  Portal Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('employees')}
                  className="hover:text-[#1E683E] dark:hover:text-[#34D399] transition cursor-pointer"
                >
                  Personnel Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('compliance')}
                  className="hover:text-[#1E683E] dark:hover:text-[#34D399] transition cursor-pointer"
                >
                  Document Compliance Radar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('payroll')}
                  className="hover:text-[#1E683E] dark:hover:text-[#34D399] transition cursor-pointer"
                >
                  Payroll & WPS Wages
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Governance & Security
            </h4>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Shield className="w-3.5 h-3.5 text-[#1E683E] dark:text-[#34D399]" />
                <span>Encrypted Personnel Records</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Protected under UAE Federal Data Privacy Law. All transactions and updates are audited.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EBF5EF] dark:bg-emerald-950/60 text-[#1E683E] dark:text-[#34D399] text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  UAE DLS Compliant
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Office of His Highness Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Official Government Portal</span>
            <span>•</span>
            <span>Abu Dhabi, United Arab Emirates</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
