import React from 'react';
import { 
  Users, 
  HardHat, 
  FileWarning, 
  CalendarClock, 
  Banknote, 
  CreditCard, 
  PlusCircle, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  TrendingUp,
  Clock
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
  // Calculations
  const totalEmployees = employees.length;
  const totalLabourers = employees.filter(e => e.employment.category === 'Labourer').length;
  const onLeaveCount = employees.filter(e => e.employment.status === 'On Leave').length;
  
  // Document compliance
  const urgentDocs = documents
    .map(doc => ({
      ...doc,
      expiryStatus: getDocumentExpiryStatus(doc.expiryDate),
    }))
    .filter(d => d.expiryStatus.status === 'expired' || d.expiryStatus.daysLeft <= 30)
    .sort((a, b) => a.expiryStatus.daysLeft - b.expiryStatus.daysLeft);

  // Payroll statistics for latest month
  const currentMonthPayments = payments.filter(p => p.period.includes('September 2026') || p.period.includes('2026-09'));
  const totalPayrollAmount = currentMonthPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const cashPayments = currentMonthPayments.filter(p => p.paymentMethod === 'Cash');
  const bankPayments = currentMonthPayments.filter(p => p.paymentMethod === 'Bank Transfer');
  const cashTotal = cashPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const bankTotal = bankPayments.reduce((sum, p) => sum + p.netAmount, 0);

  const cashPercent = totalPayrollAmount > 0 ? Math.round((cashTotal / totalPayrollAmount) * 100) : 0;
  const bankPercent = totalPayrollAmount > 0 ? 100 - cashPercent : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Royal Letterhead Hero Banner */}
      <div className="bg-[#FAF7F2] dark:bg-[#1A1715] rounded-2xl p-6 sm:p-8 border border-[#E7DEC8] dark:border-[#383129] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#231F1C] border border-[#E7DEC8] dark:border-[#3D362D] shadow-xs shrink-0">
              <RoyalEmblem size="lg" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F3EBD9] dark:bg-[#2C2417] text-[#846429] dark:text-[#E2C687] text-[10px] sm:text-xs font-bold mb-1.5 uppercase tracking-wider border border-[#E7DEC8] dark:border-[#4A3D27]">
                <span className="w-2 h-2 rounded-full bg-[#BA9547] animate-pulse" />
                Office of His Highness
              </div>
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Office of H.H. Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-stone-600 dark:text-stone-400">
                <span className="font-arabic text-sm text-[#846429] dark:text-[#D4AF37]" dir="rtl">
                  مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="font-medium text-stone-600 dark:text-stone-300">
                  Human Resources & Labour Management System
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAddEmployee}
              className="px-4 py-2.5 rounded-xl bg-[#BA9547] hover:bg-[#A17D34] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#BA9547]/20 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Personnel</span>
            </button>
            <button
              onClick={onNavigateToEmployees}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#231F1C] hover:bg-[#F8F5EE] dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border border-[#E7DEC8] dark:border-[#383129] text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
            >
              <span>Personnel Directory</span>
              <ArrowUpRight className="w-4 h-4 text-[#A17D34]" />
            </button>
          </div>
        </div>
      </div>

      {/* Simplified KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Personnel */}
        <div 
          onClick={onNavigateToEmployees}
          className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7DEC8] dark:border-[#383129] shadow-xs hover:border-[#BA9547] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Total Personnel
            </span>
            <div className="p-2 rounded-xl bg-[#FBF8F0] dark:bg-[#2A2318] text-[#846429] dark:text-[#E2C687] group-hover:scale-105 transition border border-[#ECDDBA] dark:border-[#5A451F]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
              {totalEmployees}
            </span>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              staff & workforce
            </span>
          </div>
          <div className="mt-2 text-xs text-[#846429] dark:text-[#E2C687] font-semibold flex items-center gap-1">
            <span>View all digital files</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Labourers on duty */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7DEC8] dark:border-[#383129] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Site Labourers
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
              {totalLabourers}
            </span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Active Trade Staff
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Electricians, Masons, Scaffolding, HVAC
          </p>
        </div>

        {/* Urgent Documents Alert */}
        <div 
          onClick={onNavigateToCompliance}
          className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7DEC8] dark:border-[#383129] shadow-xs hover:border-[#BA9547] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Document Expiry Alerts
            </span>
            <div className={`p-2 rounded-xl transition group-hover:scale-105 border ${
              urgentDocs.length > 0 
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <FileWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 font-serif">
              {urgentDocs.length}
            </span>
            <span className="text-xs font-semibold text-stone-500">
              expiring / expired
            </span>
          </div>
          <div className="mt-2 text-xs text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
            <span>Review compliance status</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* On Leave Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7DEC8] dark:border-[#383129] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Personnel On Leave
            </span>
            <div className="p-2 rounded-xl bg-[#F5F1E8] dark:bg-[#25201A] text-[#846429] dark:text-[#E2C687] border border-[#E7DEC8] dark:border-[#3D362D]">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
              {onLeaveCount}
            </span>
            <span className="text-xs font-semibold text-[#846429] dark:text-[#E2C687]">
              Authorized Leaves
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Annual, sick & official leaves
          </p>
        </div>
      </div>

      {/* Middle Grid: Payroll Distribution (Cash vs Bank) & Document Expiry Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Monthly Salary Disbursement & Payment Method Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1917] rounded-2xl p-6 border border-[#E7DEC8] dark:border-[#383129] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7DEC8] dark:border-[#2E2822] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#846429] dark:text-[#E2C687]" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white font-serif">
                  Monthly Salary Payout & Disbursement
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                September 2026 Disbursed Payroll: Cash vs Bank Transfer (WPS)
              </p>
            </div>

            <button
              onClick={onNavigateToPayroll}
              className="text-xs font-bold text-[#846429] dark:text-[#E2C687] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Full Payroll Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Amount Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129]">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Total Disbursed
              </span>
              <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-1 font-serif">
                AED {totalPayrollAmount.toLocaleString()}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {currentMonthPayments.length} payments recorded
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF8F0] dark:bg-[#2A2318] border border-[#ECDDBA] dark:border-[#5A451F]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#846429] dark:text-[#E2C687] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Bank Transfer (WPS)
                </span>
                <span className="text-xs font-extrabold text-[#846429] dark:text-[#E2C687]">
                  {bankPercent}%
                </span>
              </div>
              <p className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 font-serif">
                AED {bankTotal.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#A17D34] dark:text-[#DFC792] mt-0.5">
                {bankPayments.length} transfers to corporate IBANs
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5" />
                  Cash Payment
                </span>
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                  {cashPercent}%
                </span>
              </div>
              <p className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100 mt-1 font-serif">
                AED {cashTotal.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                {cashPayments.length} cash vouchers with receipts
              </p>
            </div>
          </div>

          {/* Visual Percentage Distribution Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BA9547]" />
                Bank Transfer ({bankPercent}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Cash Payment ({cashPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#F5F1E8] dark:bg-stone-800 rounded-full overflow-hidden flex border border-[#E7DEC8] dark:border-stone-700">
              <div 
                style={{ width: `${bankPercent}%` }} 
                className="bg-[#BA9547] h-full transition-all duration-500" 
                title={`Bank Transfers: ${bankPercent}%`}
              />
              <div 
                style={{ width: `${cashPercent}%` }} 
                className="bg-emerald-600 h-full transition-all duration-500" 
                title={`Cash: ${cashPercent}%`}
              />
            </div>
          </div>

          {/* Recent Payout Table */}
          <div className="overflow-x-auto pt-2">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
              Latest Processed Payment Transactions
            </p>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-stone-400 border-b border-[#E7DEC8] dark:border-[#2E2822]">
                  <th className="pb-2 font-semibold">Personnel</th>
                  <th className="pb-2 font-semibold">Period</th>
                  <th className="pb-2 font-semibold">Payment Date</th>
                  <th className="pb-2 font-semibold">Method</th>
                  <th className="pb-2 font-semibold text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DEC8] dark:divide-[#2E2822]">
                {payments.slice(0, 4).map((pay) => {
                  const emp = employees.find(e => e.id === pay.employeeId);
                  return (
                    <tr 
                      key={pay.id}
                      onClick={() => emp && onSelectEmployee(emp)}
                      className="hover:bg-[#FAF7F2] dark:hover:bg-[#25201C] cursor-pointer transition"
                    >
                      <td className="py-2.5 font-bold text-stone-900 dark:text-stone-100">
                        {emp ? `${emp.firstName} ${emp.lastName}` : pay.employeeId}
                        <span className="block text-[10px] font-normal text-stone-400">{pay.employeeId}</span>
                      </td>
                      <td className="py-2.5 text-stone-600 dark:text-stone-400">{pay.period}</td>
                      <td className="py-2.5 text-stone-600 dark:text-stone-400 font-mono">{pay.paymentDate}</td>
                      <td className="py-2.5">
                        <Badge variant={pay.paymentMethod === 'Cash' ? 'cash' : 'bank'} size="sm">
                          {pay.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-bold text-stone-900 dark:text-white font-mono">
                        AED {pay.netAmount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Document Expiry Radar & Actions */}
        <div className="bg-white dark:bg-[#1C1917] rounded-2xl p-6 border border-[#E7DEC8] dark:border-[#383129] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E7DEC8] dark:border-[#2E2822] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white font-serif">
                  Document Expiry Radar
                </h3>
              </div>
              <span className="text-xs font-extrabold text-rose-800 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                {urgentDocs.length} Active
              </span>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              Documents requiring renewal within 30 days or overdue for UAE MOHRE compliance.
            </p>

            <div className="space-y-3">
              {urgentDocs.slice(0, 4).map((doc) => {
                const emp = employees.find(e => e.id === doc.employeeId);
                const isOverdue = doc.expiryStatus.status === 'expired';

                return (
                  <div
                    key={doc.id}
                    onClick={() => emp && onSelectEmployee(emp)}
                    className="p-3 rounded-xl border border-[#E7DEC8] dark:border-[#383129] hover:border-[#BA9547] dark:hover:border-[#BA9547] bg-[#FAF7F2]/50 dark:bg-[#25201C]/50 hover:bg-[#FAF7F2] cursor-pointer transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-white truncate group-hover:text-[#846429] dark:group-hover:text-[#E2C687] transition">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                          {emp ? `${emp.firstName} ${emp.lastName} (${emp.id})` : doc.employeeId}
                        </p>
                      </div>

                      <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
                        {doc.expiryStatus.label}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span>Exp: {doc.expiryDate}</span>
                      <span className="text-[#846429] dark:text-[#E2C687] font-sans font-semibold group-hover:underline">
                        Open File →
                      </span>
                    </div>
                  </div>
                );
              })}

              {urgentDocs.length === 0 && (
                <div className="p-6 text-center text-stone-400">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                  <p className="text-xs font-semibold">All documents are up-to-date!</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onNavigateToCompliance}
            className="w-full mt-4 py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#E7DEC8] dark:border-stone-700"
          >
            <span>Open Compliance Manager</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Bottom Section: Recent Audit Log Activity */}
      <div className="bg-white dark:bg-[#1C1917] rounded-2xl p-6 border border-[#E7DEC8] dark:border-[#383129] shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E7DEC8] dark:border-[#2E2822] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#846429] dark:text-[#E2C687]" />
            <h3 className="text-base font-bold text-stone-900 dark:text-white font-serif">
              Recent Official Activity & Audit Trail
            </h3>
          </div>
          <span className="text-xs text-stone-400">
            Real-time security log
          </span>
        </div>

        <div className="space-y-3">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#25201C] transition text-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FBF8F0] dark:bg-[#2A2318] text-[#846429] dark:text-[#E2C687] border border-[#ECDDBA] dark:border-[#5A451F] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                {log.action.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {log.userName} ({log.userRole})
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-stone-600 dark:text-stone-400 mt-0.5">
                  {log.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

