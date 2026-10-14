import React, { useState, useMemo } from 'react';
import { 
  WalletCards, 
  CreditCard, 
  Banknote, 
  Search, 
  Download, 
  Printer, 
  CheckCircle, 
  PlusCircle, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Employee, SalaryPayment } from '../../types/hr';
import { Badge } from '../common/Badge';
import { generatePayslipPdf } from '../../services/pdfGenerator';
import { auth } from '../../services/auth';

interface PayrollCenterTabProps {
  employees: Employee[];
  payments: SalaryPayment[];
  onAddPayment: (pay: SalaryPayment) => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const PayrollCenterTab: React.FC<PayrollCenterTabProps> = ({
  employees,
  payments,
  onAddPayment,
  onSelectEmployee,
}) => {
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'Cash' | 'Bank Transfer'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Lookup map
  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach(e => map.set(e.id, e));
    return map;
  }, [employees]);

  // Distinct periods
  const periods = useMemo(() => {
    const set = new Set<string>();
    payments.forEach(p => set.add(p.period));
    return Array.from(set).sort().reverse();
  }, [payments]);

  // Financial aggregates
  const totalPayroll = useMemo(() => payments.reduce((sum, p) => sum + p.netAmount, 0), [payments]);
  const cashTotal = useMemo(() => payments.filter(p => p.paymentMethod === 'Cash').reduce((sum, p) => sum + p.netAmount, 0), [payments]);
  const bankTotal = useMemo(() => payments.filter(p => p.paymentMethod === 'Bank Transfer').reduce((sum, p) => sum + p.netAmount, 0), [payments]);

  const cashCount = payments.filter(p => p.paymentMethod === 'Cash').length;
  const bankCount = payments.filter(p => p.paymentMethod === 'Bank Transfer').length;

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (periodFilter !== 'ALL' && p.period !== periodFilter) return false;
      if (methodFilter !== 'ALL' && p.paymentMethod !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const emp = employeeMap.get(p.employeeId);
        const nameMatch = emp ? `${emp.firstName} ${emp.lastName} ${emp.id}`.toLowerCase().includes(q) : false;
        const refMatch = p.transactionReference.toLowerCase().includes(q);
        const periodMatch = p.period.toLowerCase().includes(q);
        if (!nameMatch && !refMatch && !periodMatch) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, periodFilter, methodFilter, searchQuery, employeeMap]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-white tracking-tight">
            Payroll & Salary Payment Ledger
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Transparent tracking of exact payment dates, cash receipt vouchers, and bank WPS transfers.
          </p>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Payout Disbursed
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            AED {totalPayroll.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {payments.length} total payments processed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#EBF5EF] dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#1E683E] dark:text-[#34D399] uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              Bank Transfer (WPS)
            </span>
            <Badge variant="bank" size="sm">{bankCount} Disbursed</Badge>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            AED {bankTotal.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#1E683E] dark:text-emerald-300 mt-1">
            Direct bank routing for administrative & technical personnel
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Cash Payments
            </span>
            <Badge variant="cash" size="sm">{cashCount} Disbursed</Badge>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            AED {cashTotal.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Site workforce payments with signed cash vouchers
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search personnel, ID, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E683E] text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="ALL">All Payment Periods</option>
            {periods.map(pr => (
              <option key={pr} value={pr}>{pr}</option>
            ))}
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="ALL">All Methods</option>
            <option value="Cash">Cash Payments Only</option>
            <option value="Bank Transfer">Bank Transfers Only</option>
          </select>
        </div>
      </div>

      {/* Master Payments Ledger Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Personnel</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Exact Payment Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Transaction / Voucher Ref</th>
                <th className="py-3 px-4">Allowances / OT</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4 text-right">Net Amount</th>
                <th className="py-3 px-4 text-center">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map((p) => {
                const emp = employeeMap.get(p.employeeId);

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                  >
                    <td className="py-3 px-4">
                      {emp ? (
                        <div 
                          onClick={() => onSelectEmployee(emp)}
                          className="cursor-pointer group"
                        >
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#1E683E] dark:group-hover:text-[#34D399] transition font-serif">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {emp.id} • {emp.employment.trade}
                          </p>
                        </div>
                      ) : (
                        <span className="font-mono text-slate-400">{p.employeeId}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {p.period}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {p.paymentDate}
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={p.paymentMethod === 'Cash' ? 'cash' : 'bank'} size="sm">
                        {p.paymentMethod === 'Cash' ? 'Cash Voucher' : 'Bank Transfer'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {p.transactionReference}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      AED {(p.allowances + p.overtimePay).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono text-rose-700">
                      {p.deductions > 0 ? `-AED ${p.deductions.toLocaleString()}` : '0.00'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                      AED {p.netAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {emp && (
                        <button
                          onClick={() => generatePayslipPdf(emp, p)}
                          className="px-2.5 py-1.5 bg-[#EBF5EF] hover:bg-emerald-100 dark:bg-emerald-950/80 text-[#1E683E] dark:text-[#34D399] font-bold rounded-lg transition inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                          title="Generate Official Payslip PDF"
                        >
                          <Printer className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

