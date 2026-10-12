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

  // Payroll statistics for latest month (September 2026)
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
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Centralized Workforce System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Workforce Operations Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Real-time monitoring of labor files, legal document validity, leave balances, and salary disbursements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddEmployee}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Employee / Labour</span>
            </button>
            <button
              onClick={onNavigateToEmployees}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs sm:text-sm font-semibold backdrop-blur-xs flex items-center gap-2 transition"
            >
              <span>Employee Directory</span>
              <ArrowUpRight className="w-4 h-4 text-indigo-300" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div 
          onClick={onNavigateToEmployees}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Workforce
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalEmployees}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              staff & labourers
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <span>Manage digital files</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Labourers on duty */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Site Labourers
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalLabourers}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Active Trade Staff
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Electricians, Masons, Scaffolding, HVAC
          </p>
        </div>

        {/* Urgent Documents Alert */}
        <div 
          onClick={onNavigateToCompliance}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Doc Expiry Alerts
            </span>
            <div className={`p-2 rounded-xl transition group-hover:scale-110 ${
              urgentDocs.length > 0 
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              <FileWarning className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {urgentDocs.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              expiring / expired
            </span>
          </div>
          <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
            <span>Review compliance status</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* On Leave Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Staff On Leave
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {onLeaveCount}
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Authorized Leaves
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Annual, sick & emergency leaves
          </p>
        </div>
      </div>

      {/* Middle Grid: Payroll Distribution (Cash vs Bank) & Document Expiry Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Monthly Salary Disbursement & Payment Method Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Salary Payout & Payment Methods
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                September 2026 Disbursed Payroll: Cash vs Bank Transfer (WPS)
              </p>
            </div>

            <button
              onClick={onNavigateToPayroll}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Full Payroll Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Amount Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Disbursed
              </span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                AED {totalPayrollAmount.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentMonthPayments.length} payments recorded
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Bank Transfer (WPS)
                </span>
                <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300">
                  {bankPercent}%
                </span>
              </div>
              <p className="text-xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                AED {bankTotal.toLocaleString()}
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-300 mt-0.5">
                {bankPayments.length} transfers to corporate IBANs
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5" />
                  Cash Payment
                </span>
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  {cashPercent}%
                </span>
              </div>
              <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
                AED {cashTotal.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-0.5">
                {cashPayments.length} cash vouchers with signatures
              </p>
            </div>
          </div>

          {/* Visual Percentage Distribution Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Bank Transfer ({bankPercent}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Cash Payment ({cashPercent}%)
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${bankPercent}%` }} 
                className="bg-blue-600 h-full transition-all duration-500" 
                title={`Bank Transfers: ${bankPercent}%`}
              />
              <div 
                style={{ width: `${cashPercent}%` }} 
                className="bg-emerald-500 h-full transition-all duration-500" 
                title={`Cash: ${cashPercent}%`}
              />
            </div>
          </div>

          {/* Recent Payout Table */}
          <div className="overflow-x-auto pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Latest Processed Payment Transactions
            </p>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-2 font-semibold">Employee</th>
                  <th className="pb-2 font-semibold">Period</th>
                  <th className="pb-2 font-semibold">Payment Date</th>
                  <th className="pb-2 font-semibold">Method</th>
                  <th className="pb-2 font-semibold text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.slice(0, 4).map((pay) => {
                  const emp = employees.find(e => e.id === pay.employeeId);
                  return (
                    <tr 
                      key={pay.id}
                      onClick={() => emp && onSelectEmployee(emp)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                        {emp ? `${emp.firstName} ${emp.lastName}` : pay.employeeId}
                        <span className="block text-[10px] font-normal text-slate-400">{pay.employeeId}</span>
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{pay.period}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono">{pay.paymentDate}</td>
                      <td className="py-2.5">
                        <Badge variant={pay.paymentMethod === 'Cash' ? 'cash' : 'bank'} size="sm">
                          {pay.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white font-mono">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Document Expiry Radar
                </h3>
              </div>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                {urgentDocs.length} Active
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
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
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 cursor-pointer transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {emp ? `${emp.firstName} ${emp.lastName} (${emp.id})` : doc.employeeId}
                        </p>
                      </div>

                      <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
                        {doc.expiryStatus.label}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Exp: {doc.expiryDate}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-sans font-semibold group-hover:underline">
                        Open File →
                      </span>
                    </div>
                  </div>
                );
              })}

              {urgentDocs.length === 0 && (
                <div className="p-6 text-center text-slate-400">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold">All documents are up-to-date!</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onNavigateToCompliance}
            className="w-full mt-4 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>Open Compliance Manager</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Bottom Section: Recent Audit Log Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent System Modifications & Audit Feed
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Real-time security trail
          </span>
        </div>

        <div className="space-y-3">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {log.action.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {log.userName} ({log.userRole})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
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
