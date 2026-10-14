import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  CreditCard, 
  UserPlus, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Banknote, 
  FileText, 
  Calendar,
  ChevronRight,
  Sparkles,
  HardHat
} from 'lucide-react';
import { Employee, EmployeeDocument, SalaryPayment, AuditLog } from '../../types/hr';
import { getDocumentExpiryStatus } from '../../services/storage';
import { Badge } from '../common/Badge';
import { RoyalEmblem } from '../common/RoyalEmblem';

interface DashboardTabProps {
  employees: Employee[];
  documents: EmployeeDocument[];
  payments: SalaryPayment[];
  auditLogs: AuditLog[];
  onNavigateToEmployees: () => void;
  onNavigateToCompliance: () => void;
  onNavigateToPayroll: () => void;
  onSelectEmployee: (emp: Employee) => void;
  onOpenAddEmployee: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  employees,
  documents,
  payments,
  auditLogs,
  onNavigateToEmployees,
  onNavigateToCompliance,
  onNavigateToPayroll,
  onSelectEmployee,
  onOpenAddEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBottomTab, setActiveBottomTab] = useState<'activity' | 'payroll'>('activity');

  // Key metrics calculation
  const totalEmployees = employees.length;
  const totalLabourers = employees.filter(e => e.employment.category === 'Labourer').length;
  const totalStaff = totalEmployees - totalLabourers;
  const onLeaveCount = employees.filter(e => e.employment.status === 'On Leave').length;
  
  // Document compliance analysis
  const urgentDocs = documents
    .map(doc => ({
      ...doc,
      expiryStatus: getDocumentExpiryStatus(doc.expiryDate),
    }))
    .filter(d => d.expiryStatus.status === 'expired' || d.expiryStatus.daysLeft <= 30)
    .sort((a, b) => a.expiryStatus.daysLeft - b.expiryStatus.daysLeft);

  const complianceRate = documents.length > 0
    ? Math.round(((documents.length - urgentDocs.length) / documents.length) * 100)
    : 100;

  // Monthly payroll breakdown
  const currentMonthPayments = payments.filter(p => p.period.includes('September 2026') || p.period.includes('2026-09'));
  const totalPayrollAmount = currentMonthPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const cashPayments = currentMonthPayments.filter(p => p.paymentMethod === 'Cash');
  const bankPayments = currentMonthPayments.filter(p => p.paymentMethod === 'Bank Transfer');
  const cashTotal = cashPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const bankTotal = bankPayments.reduce((sum, p) => sum + p.netAmount, 0);

  // Live search suggestions (u.ae style instant service search)
  const searchResults = searchQuery.trim() === '' ? [] : employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.employment.jobTitle.toLowerCase().includes(q) ||
      e.employment.trade.toLowerCase().includes(q) ||
      e.employment.laborCardNumber.toLowerCase().includes(q) ||
      e.employment.nationalIdNumber.toLowerCase().includes(q)
    );
  }).slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* 1. HERO & SEARCH SECTION (u.ae Official Portal Vibe) */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#FAF7F2] to-[#F5EFEB] dark:from-[#1E1B18] dark:to-[#171412] p-8 sm:p-12 border border-[#E7DEC8] dark:border-[#3A332B] shadow-xs text-center">
        
        {/* Subtle decorative crest badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-[#25211D] border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs mb-4">
          <RoyalEmblem size="sm" />
          <span className="font-arabic text-sm text-[#846429] dark:text-[#D4AF37]" dir="rtl">
            مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 max-w-3xl mx-auto leading-tight">
          Office of His Highness Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
        </h1>
        <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-400 font-medium max-w-xl mx-auto">
          Official Human Resources & Workforce Management Portal
        </p>

        {/* Central Search Box (u.ae signature experience) */}
        <div className="mt-8 max-w-2xl mx-auto relative">
          <div className="relative flex items-center shadow-sm rounded-2xl bg-white dark:bg-[#231F1C] border border-[#E7DEC8] dark:border-[#3D352E] focus-within:border-[#BA9547] focus-within:ring-2 focus-within:ring-[#BA9547]/20 transition-all">
            <div className="pl-4 pr-2 text-[#BA9547]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personnel by name, Emirates ID, trade, or designation..."
              className="w-full py-4 pr-4 bg-transparent text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-3 px-2 py-1 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Instant Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#231F1C] rounded-2xl border border-[#E7DEC8] dark:border-[#3D352E] shadow-xl z-30 overflow-hidden text-left divide-y divide-[#E7DEC8]/50 dark:divide-[#3D352E]">
              <div className="px-4 py-2 bg-[#FAF7F2] dark:bg-[#1E1B18] text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Matching Personnel Records ({searchResults.length})
              </div>
              {searchResults.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    onSelectEmployee(emp);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#FAF7F2] dark:hover:bg-[#2A2318] transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#2A2318] border border-[#E7DEC8] dark:border-[#3D352E] flex items-center justify-center font-serif font-bold text-sm text-[#846429] dark:text-[#D4AF37]">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-[#BA9547] transition">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-stone-500">
                        {emp.employment.jobTitle} • {emp.employment.trade} • ID: {emp.id}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#BA9547] transition" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Filter Shortcuts */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-stone-400 font-medium">Quick filters:</span>
            <button
              onClick={onNavigateToEmployees}
              className="px-3 py-1 rounded-full bg-white dark:bg-[#25211D] border border-[#E7DEC8] dark:border-[#3D352E] text-stone-700 dark:text-stone-300 hover:border-[#BA9547] hover:text-[#BA9547] transition"
            >
              All Personnel ({totalEmployees})
            </button>
            <button
              onClick={onNavigateToEmployees}
              className="px-3 py-1 rounded-full bg-white dark:bg-[#25211D] border border-[#E7DEC8] dark:border-[#3D352E] text-stone-700 dark:text-stone-300 hover:border-[#BA9547] hover:text-[#BA9547] transition"
            >
              Labourers ({totalLabourers})
            </button>
            <button
              onClick={onNavigateToCompliance}
              className="px-3 py-1 rounded-full bg-white dark:bg-[#25211D] border border-[#E7DEC8] dark:border-[#3D352E] text-stone-700 dark:text-stone-300 hover:border-[#BA9547] hover:text-[#BA9547] transition flex items-center gap-1"
            >
              <span>Expiring Docs</span>
              {urgentDocs.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {urgentDocs.length}
                </span>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 2. THREE HIGH-LEVEL STATUS PILLARS (Clean, glanceable, zero noise) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Workforce Overview */}
        <div 
          onClick={onNavigateToEmployees}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs hover:border-[#BA9547] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <span>Official Workforce</span>
            <Users className="w-4 h-4 text-[#BA9547]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-black text-stone-900 dark:text-white">
              {totalEmployees}
            </span>
            <span className="text-xs text-stone-500">Active Members</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-2">
            <span>{totalStaff} Administrative</span>
            <span>•</span>
            <span>{totalLabourers} Technical Labourers</span>
          </div>
        </div>

        {/* Compliance Health */}
        <div 
          onClick={onNavigateToCompliance}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs hover:border-[#BA9547] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <span>Document Compliance</span>
            <ShieldCheck className="w-4 h-4 text-[#BA9547]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-black text-stone-900 dark:text-white">
              {complianceRate}%
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              urgentDocs.length === 0 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
            }`}>
              {urgentDocs.length === 0 ? '100% In Good Standing' : `${urgentDocs.length} Action Needed`}
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            Passports, visas, and Emirates IDs monitored
          </p>
        </div>

        {/* Monthly Payroll */}
        <div 
          onClick={onNavigateToPayroll}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs hover:border-[#BA9547] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <span>Monthly Disbursement</span>
            <CreditCard className="w-4 h-4 text-[#BA9547]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-black text-stone-900 dark:text-white font-mono">
              AED {totalPayrollAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-2">
            <span>WPS: AED {bankTotal.toLocaleString()}</span>
            <span>•</span>
            <span>Cash: AED {cashTotal.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* 3. KEY SERVICES & QUICK ACTIONS (u.ae Signature Service Directory Tiles) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-serif">
              Key Services & Operations
            </h2>
            <p className="text-xs text-stone-500">
              Direct access to essential human resource tasks and registry management
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Service 1: Personnel Directory */}
          <div 
            onClick={onNavigateToEmployees}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs hover:border-[#BA9547] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] dark:bg-[#2A2318] text-[#846429] dark:text-[#D4AF37] border border-[#E7DEC8] dark:border-[#3D352E] flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-[#BA9547] transition">
                Personnel Directory
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Browse digital files, trade assignments, emergency contacts, and job contracts.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E7DEC8]/60 dark:border-[#3D352E] flex items-center justify-between text-xs font-bold text-[#846429] dark:text-[#D4AF37]">
              <span>Open Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 2: Document Compliance */}
          <div 
            onClick={onNavigateToCompliance}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs hover:border-[#BA9547] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] dark:bg-[#2A2318] text-[#846429] dark:text-[#D4AF37] border border-[#E7DEC8] dark:border-[#3D352E] flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-[#BA9547] transition">
                Compliance Radar
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Monitor 30/60/90-day expiry schedules and export official CSV audit reports.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E7DEC8]/60 dark:border-[#3D352E] flex items-center justify-between text-xs font-bold text-[#846429] dark:text-[#D4AF37]">
              <span>View Expirations</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 3: Payroll Center */}
          <div 
            onClick={onNavigateToPayroll}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs hover:border-[#BA9547] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] dark:bg-[#2A2318] text-[#846429] dark:text-[#D4AF37] border border-[#E7DEC8] dark:border-[#3D352E] flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-[#BA9547] transition">
                Payroll & Wages
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Disburse salaries, generate official letterhead PDF payslips, and manage WPS records.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E7DEC8]/60 dark:border-[#3D352E] flex items-center justify-between text-xs font-bold text-[#846429] dark:text-[#D4AF37]">
              <span>Manage Payroll</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 4: Register Personnel */}
          <div 
            onClick={onOpenAddEmployee}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#BA9547] to-[#846429] text-white shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition backdrop-blur-xs">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">
                Register Personnel
              </h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Add a new staff officer or specialized site technician to the official Office roster.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
              <span>Start Registration</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* 4. IMMEDIATE ATTENTION BANNER (Only what requires user action) */}
      {urgentDocs.length > 0 ? (
        <div className="p-5 rounded-2xl bg-[#FFFBF0] dark:bg-[#25201A] border border-[#EADBB6] dark:border-[#4D3F27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                {urgentDocs.length} Document(s) Require Renewal Attention
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Earliest: <strong className="text-amber-800 dark:text-amber-300">{urgentDocs[0]?.title}</strong> for {employees.find(e => e.id === urgentDocs[0]?.employeeId)?.firstName} {employees.find(e => e.id === urgentDocs[0]?.employeeId)?.lastName} (Expires: {urgentDocs[0]?.expiryDate})
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToCompliance}
            className="px-4 py-2 rounded-xl bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Review & Renew</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#F4F9F5] dark:bg-[#1A261D] border border-[#CDE5D4] dark:border-[#284530] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              Official Registry in Good Standing — All personnel credentials, visas, and Emirates IDs are active and valid.
            </p>
          </div>
          <button
            onClick={onNavigateToCompliance}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
          >
            Compliance Status
          </button>
        </div>
      )}

      {/* 5. PROGRESSIVE DETAIL VIEWER (One clean tabbed view instead of overwhelming stacked tables) */}
      <div className="bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs overflow-hidden">
        
        {/* Clean Tab Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#E7DEC8]/60 dark:border-[#3D352E]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveBottomTab('activity')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeBottomTab === 'activity'
                  ? 'bg-[#FAF7F2] dark:bg-[#2A2318] text-[#846429] dark:text-[#D4AF37] border border-[#E7DEC8] dark:border-[#3D352E]'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Activity Trail</span>
            </button>
            <button
              onClick={() => setActiveBottomTab('payroll')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeBottomTab === 'payroll'
                  ? 'bg-[#FAF7F2] dark:bg-[#2A2318] text-[#846429] dark:text-[#D4AF37] border border-[#E7DEC8] dark:border-[#3D352E]'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Recent Wage Disbursements</span>
            </button>
          </div>

          <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
            {activeBottomTab === 'activity' ? 'Audit timeline' : 'September 2026 payout records'}
          </span>
        </div>

        {/* Tab 1: Audit Activity */}
        {activeBottomTab === 'activity' && (
          <div className="p-6 divide-y divide-[#E7DEC8]/40 dark:divide-[#3D352E]/40">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] dark:bg-[#2A2318] text-[#846429] dark:text-[#D4AF37] border border-[#E7DEC8] dark:border-[#3D352E] flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    {log.action.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-200">
                      {log.userName} <span className="font-normal text-stone-400">({log.userRole})</span>
                    </p>
                    <p className="text-stone-600 dark:text-stone-400 mt-0.5">{log.details}</p>
                  </div>
                </div>
                <span className="text-[11px] text-stone-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Recent Disbursements */}
        {activeBottomTab === 'payroll' && (
          <div className="p-6 divide-y divide-[#E7DEC8]/40 dark:divide-[#3D352E]/40">
            {payments.slice(0, 4).map((pay) => {
              const emp = employees.find(e => e.id === pay.employeeId);
              return (
                <div key={pay.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] dark:bg-[#2A2318] text-[#846429] dark:text-[#D4AF37] border border-[#E7DEC8] dark:border-[#3D352E] flex items-center justify-center font-bold shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">
                        {emp ? `${emp.firstName} ${emp.lastName}` : pay.employeeId}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {pay.period} • {pay.paymentDate} • Ref: {pay.transactionReference}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={pay.paymentMethod === 'Cash' ? 'cash' : 'bank'} size="sm">
                      {pay.paymentMethod}
                    </Badge>
                    <span className="font-mono font-bold text-stone-900 dark:text-white text-sm">
                      AED {pay.netAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
