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
  ChevronRight,
  HardHat,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Employee, EmployeeDocument, SalaryPayment, AuditLog } from '../../types/hr';
import { getDocumentExpiryStatus } from '../../services/storage';
import { Badge } from '../common/Badge';

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

  // Key metrics
  const totalEmployees = employees.length;
  const totalLabourers = employees.filter(e => e.employment.category === 'Labourer').length;
  const totalStaff = totalEmployees - totalLabourers;
  
  // Document compliance
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

  // Monthly payroll calculation
  const currentMonthPayments = payments.filter(p => p.period.includes('September 2026') || p.period.includes('2026-09'));
  const totalPayrollAmount = currentMonthPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const cashPayments = currentMonthPayments.filter(p => p.paymentMethod === 'Cash');
  const bankPayments = currentMonthPayments.filter(p => p.paymentMethod === 'Bank Transfer');
  const cashTotal = cashPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const bankTotal = bankPayments.reduce((sum, p) => sum + p.netAmount, 0);

  // Instant Search Autocomplete (u.ae style)
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* 1. BRIGHT & AIRY HERO (u.ae Official Government Vibe) */}
      <div className="relative rounded-3xl bg-white p-8 sm:p-12 border border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] text-center overflow-hidden">
        
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        {/* Entity Title Pill */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E8F5E9] border border-emerald-200/80 shadow-xs mb-4">
          <span className="font-arabic text-sm text-[#088450] font-bold" dir="rtl">
            مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Office of His Highness Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
          Welcome to the Official Human Resources & Personnel Management Portal
        </p>

        {/* Central Search Box (u.ae signature experience: rounded-full with right emerald button) */}
        <div className="mt-8 max-w-2xl mx-auto relative">
          <div className="relative flex items-center shadow-xs rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-[#088450] focus-within:ring-2 focus-within:ring-[#088450]/20 p-1.5 pl-5 transition-all">
            <div className="text-slate-400 pr-2.5">
              <Search className="w-5 h-5 text-[#088450]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personnel by name, Emirates ID, trade, or designation..."
              className="w-full py-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-2 px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  onNavigateToEmployees();
                }
              }}
              className="px-5 py-2.5 rounded-full bg-[#088450] hover:bg-[#066e42] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Instant Search Suggestions */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl z-30 overflow-hidden text-left divide-y divide-slate-100 dark:divide-slate-700">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Personnel ({searchResults.length})
              </div>
              {searchResults.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    onSelectEmployee(emp);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] dark:bg-emerald-950 text-[#088450] dark:text-[#34D399] border border-emerald-100 dark:border-emerald-900 flex items-center justify-center font-bold text-sm">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#088450] transition">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {emp.employment.jobTitle} • {emp.employment.trade} • ID: {emp.id}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#088450] transition" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Filter Shortcuts (u.ae pill style) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick links:</span>
            <button
              onClick={onNavigateToEmployees}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200/80 dark:border-slate-700 shadow-xs transition cursor-pointer"
            >
              All Personnel ({totalEmployees})
            </button>
            <button
              onClick={onNavigateToEmployees}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200/80 dark:border-slate-700 shadow-xs transition cursor-pointer"
            >
              Labourers ({totalLabourers})
            </button>
            <button
              onClick={onNavigateToCompliance}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200/80 dark:border-slate-700 shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Document Expirations</span>
              {urgentDocs.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {urgentDocs.length}
                </span>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 2. THREE AT-A-GLANCE METRICS (Bright, Crisp, Elevated) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Metric 1: Total Personnel */}
        <div 
          onClick={onNavigateToEmployees}
          className="card-uae p-6 rounded-2xl cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Personnel
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalEmployees}
              </span>
              <span className="text-xs text-slate-500 font-medium">Team Members</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {totalStaff} Administrative • {totalLabourers} Technical Labourers
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#088450] dark:text-[#34D399] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Compliance Health */}
        <div 
          onClick={onNavigateToCompliance}
          className="card-uae p-6 rounded-2xl cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Document Compliance
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {complianceRate}%
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                urgentDocs.length === 0 
                  ? 'bg-emerald-100 text-[#088450] dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {urgentDocs.length === 0 ? 'Fully Valid' : `${urgentDocs.length} Action Needed`}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Passports, visas, and Emirates IDs monitored
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#088450] dark:text-[#34D399] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Monthly Disbursement */}
        <div 
          onClick={onNavigateToPayroll}
          className="card-uae p-6 rounded-2xl cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              September Payroll
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                AED {totalPayrollAmount.toLocaleString()}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              WPS: AED {bankTotal.toLocaleString()} • Cash: AED {cashTotal.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FEF9EE] dark:bg-amber-950/60 text-[#C5A85A] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. KEY SERVICES & DIRECT ACCESS (u.ae Style Grid) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Key Services & Operations
            </h2>
            <p className="text-xs text-slate-500">
              Direct access to essential human resource tasks and personnel records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Personnel Directory */}
          <div 
            onClick={onNavigateToEmployees}
            className="card-uae p-7 rounded-2xl cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#088450] dark:text-[#34D399] flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#088450] transition">
                Personnel Directory
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Browse complete employee files, job titles, trade specialities, and contact details.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#088450] dark:text-[#34D399]">
              <span>Open Directory</span>
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#088450] flex items-center justify-center group-hover:bg-[#088450] group-hover:text-white transition">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Document Compliance */}
          <div 
            onClick={onNavigateToCompliance}
            className="card-uae p-7 rounded-2xl cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                Compliance Radar
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Monitor 30/60/90-day expiry schedules and export official CSV compliance reports.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>View Expirations</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 3: Payroll Center */}
          <div 
            onClick={onNavigateToPayroll}
            className="card-uae p-7 rounded-2xl cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FEF9EE] dark:bg-amber-950/60 text-[#C5A85A] flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#C5A85A] transition">
                Payroll & Wages
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Process monthly wages, generate official letterhead PDF payslips, and track WPS disbursements.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#C5A85A]">
              <span>Manage Payroll</span>
              <div className="w-8 h-8 rounded-full bg-[#FEF9EE] text-[#C5A85A] flex items-center justify-center group-hover:bg-[#C5A85A] group-hover:text-white transition">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 4: Register Personnel */}
          <div 
            onClick={onOpenAddEmployee}
            className="p-7 rounded-2xl bg-gradient-to-br from-[#088450] to-[#05633C] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition backdrop-blur-xs">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">
                Register Personnel
              </h3>
              <p className="text-xs text-white/90 mt-2 leading-relaxed">
                Add an administrative officer or specialized site technician to the official Office roster.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
              <span>Start Registration</span>
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center group-hover:bg-white group-hover:text-[#088450] transition">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. REASSURING STATUS / ACTION BANNER */}
      {urgentDocs.length > 0 ? (
        <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {urgentDocs.length} Document(s) Expiring Soon
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Earliest renewal: <strong className="text-amber-800 dark:text-amber-300">{urgentDocs[0]?.title}</strong> for {employees.find(e => e.id === urgentDocs[0]?.employeeId)?.firstName} {employees.find(e => e.id === urgentDocs[0]?.employeeId)?.lastName} (Expiry: {urgentDocs[0]?.expiryDate})
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToCompliance}
            className="px-4 py-2 rounded-xl bg-[#088450] hover:bg-[#066e42] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Review & Renew</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#088450] dark:text-[#34D399] shrink-0" />
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              Official Registry in Good Standing — All personnel records, visas, and Emirates IDs are active and valid.
            </p>
          </div>
          <button
            onClick={onNavigateToCompliance}
            className="text-xs font-bold text-[#088450] dark:text-[#34D399] hover:underline shrink-0 cursor-pointer"
          >
            View Status
          </button>
        </div>
      )}

      {/* 5. EASY-TO-USE ACTIVITY & PAYMENT SWITCHER (Clean, peaceful rows) */}
      <div className="card-uae rounded-2xl overflow-hidden">
        
        {/* Clean Pill Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveBottomTab('activity')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'activity'
                  ? 'bg-[#E8F5E9] dark:bg-emerald-950 text-[#088450] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Activity Trail</span>
            </button>
            <button
              onClick={() => setActiveBottomTab('payroll')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'payroll'
                  ? 'bg-[#E8F5E9] dark:bg-emerald-950 text-[#088450] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Recent Wage Disbursements</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            {activeBottomTab === 'activity' ? 'Audit timeline' : 'September 2026 payout records'}
          </span>
        </div>

        {/* Tab 1: Audit Activity */}
        {activeBottomTab === 'activity' && (
          <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    {log.action.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {log.userName} <span className="font-normal text-slate-400">({log.userRole})</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{log.details}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Recent Disbursements */}
        {activeBottomTab === 'payroll' && (
          <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
            {payments.slice(0, 4).map((pay) => {
              const emp = employees.find(e => e.id === pay.employeeId);
              return (
                <div key={pay.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] dark:bg-slate-800 text-[#088450] dark:text-[#34D399] border border-emerald-200 dark:border-slate-700 flex items-center justify-center font-bold shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {emp ? `${emp.firstName} ${emp.lastName}` : pay.employeeId}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {pay.period} • {pay.paymentDate} • Ref: {pay.transactionReference}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={pay.paymentMethod === 'Cash' ? 'cash' : 'bank'} size="sm">
                      {pay.paymentMethod}
                    </Badge>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
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
