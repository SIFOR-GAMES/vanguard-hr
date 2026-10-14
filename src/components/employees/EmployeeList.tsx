import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  Table as TableIcon, 
  PlusCircle, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileWarning, 
  ChevronRight, 
  CreditCard, 
  Banknote,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Employee, EmployeeDocument } from '../../types/hr';
import { Badge } from '../common/Badge';
import { getDocumentExpiryStatus } from '../../services/storage';

interface EmployeeListProps {
  employees: Employee[];
  documents: EmployeeDocument[];
  onSelectEmployee: (employee: Employee) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  documents,
  onSelectEmployee,
  onOpenAddModal,
  searchQuery,
  onSearchChange,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [tradeFilter, setTradeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Distinct trades
  const uniqueTrades = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.employment.trade) set.add(e.employment.trade);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Document expiry status map by employee ID
  const employeeComplianceMap = useMemo(() => {
    const map = new Map<string, { hasExpired: boolean; hasExpiring: boolean; urgentCount: number }>();
    
    employees.forEach(emp => {
      const empDocs = documents.filter(d => d.employeeId === emp.id);
      let hasExpired = false;
      let hasExpiring = false;
      let urgentCount = 0;

      empDocs.forEach(d => {
        const status = getDocumentExpiryStatus(d.expiryDate);
        if (status.status === 'expired') {
          hasExpired = true;
          urgentCount++;
        } else if (status.daysLeft <= 60) {
          hasExpiring = true;
          urgentCount++;
        }
      });

      map.set(emp.id, { hasExpired, hasExpiring, urgentCount });
    });

    return map;
  }, [employees, documents]);

  // Filtering
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q);
        const matchesId = emp.id.toLowerCase().includes(q);
        const matchesTrade = emp.employment.trade.toLowerCase().includes(q);
        const matchesJob = emp.employment.jobTitle.toLowerCase().includes(q);
        const matchesPhone = emp.contact.phone.toLowerCase().includes(q);
        const matchesLabor = emp.employment.laborCardNumber.toLowerCase().includes(q);
        const matchesPassport = emp.employment.passportNumber.toLowerCase().includes(q);

        if (!matchesName && !matchesId && !matchesTrade && !matchesJob && !matchesPhone && !matchesLabor && !matchesPassport) {
          return false;
        }
      }

      // Category
      if (categoryFilter !== 'ALL' && emp.employment.category !== categoryFilter) {
        return false;
      }

      // Trade
      if (tradeFilter !== 'ALL' && emp.employment.trade !== tradeFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'ALL' && emp.employment.status !== statusFilter) {
        return false;
      }

      // Payment method
      if (paymentFilter !== 'ALL' && emp.salaryStructure.preferredPaymentMethod !== paymentFilter) {
        return false;
      }

      // Compliance
      if (complianceFilter !== 'ALL') {
        const comp = employeeComplianceMap.get(emp.id);
        if (complianceFilter === 'EXPIRED' && !comp?.hasExpired) return false;
        if (complianceFilter === 'EXPIRING' && !comp?.hasExpiring && !comp?.hasExpired) return false;
        if (complianceFilter === 'VALID' && (comp?.hasExpired || comp?.hasExpiring)) return false;
      }

      return true;
    });
  }, [employees, searchQuery, categoryFilter, tradeFilter, statusFilter, paymentFilter, complianceFilter, employeeComplianceMap]);

  const resetFilters = () => {
    setCategoryFilter('ALL');
    setTradeFilter('ALL');
    setStatusFilter('ALL');
    setComplianceFilter('ALL');
    setPaymentFilter('ALL');
    onSearchChange('');
  };

  const hasActiveFilters = categoryFilter !== 'ALL' || tradeFilter !== 'ALL' || statusFilter !== 'ALL' || complianceFilter !== 'ALL' || paymentFilter !== 'ALL' || searchQuery.trim() !== '';

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-white tracking-tight">
              Personnel & Staff Directory
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FBF8F0] dark:bg-[#2A2318] text-[#846429] dark:text-[#E2C687] border border-[#ECDDBA] dark:border-[#5A451F]">
              {filteredEmployees.length} of {employees.length} Records
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Individual digital dossiers, document compliance verification, and compensation ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#BA9547] hover:bg-[#A17D34] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Personnel</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, View Mode, Filters Button */}
      <div className="bg-white dark:bg-[#1C1917] p-4 rounded-2xl border border-[#E7DEC8] dark:border-[#383129] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, ID, trade, mobile, passport..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA9547] text-stone-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle & View Switcher */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                showFilters || hasActiveFilters
                  ? 'bg-[#FBF8F0] dark:bg-[#2A2318] text-[#846429] dark:text-[#E2C687] border-[#ECDDBA] dark:border-[#5A451F]'
                  : 'bg-[#FAF7F2] dark:bg-[#24201C] text-stone-600 dark:text-stone-300 border-[#E7DEC8] dark:border-[#383129]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#BA9547]" />
              )}
            </button>

            {/* View Mode Buttons */}
            <div className="flex items-center p-1 bg-[#FAF7F2] dark:bg-[#24201C] rounded-xl border border-[#E7DEC8] dark:border-[#383129]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-700 text-[#846429] dark:text-[#E2C687] shadow-xs'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
                title="Grid Card View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-stone-700 text-[#846429] dark:text-[#E2C687] shadow-xs'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="pt-3 border-t border-[#E7DEC8] dark:border-[#2E2822] grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129] text-stone-800 dark:text-stone-200"
              >
                <option value="ALL">All Categories</option>
                <option value="Labourer">Labourer</option>
                <option value="Staff">Staff</option>
                <option value="Technical">Technical</option>
              </select>
            </div>

            {/* Trade */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                Trade / Specialty
              </label>
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129] text-stone-800 dark:text-stone-200"
              >
                <option value="ALL">All Trades</option>
                {uniqueTrades.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                Duty Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129] text-stone-800 dark:text-stone-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Probation">Probation</option>
              </select>
            </div>

            {/* Document Compliance */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                Document Status
              </label>
              <select
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129] text-stone-800 dark:text-stone-200"
              >
                <option value="ALL">All Documents</option>
                <option value="EXPIRED">Has Expired Docs</option>
                <option value="EXPIRING">Expiring &lt; 60 Days</option>
                <option value="VALID">All Documents Valid</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                Salary Method
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129] text-stone-800 dark:text-stone-200"
              >
                <option value="ALL">All Methods</option>
                <option value="Cash">Cash Payment</option>
                <option value="Bank Transfer">Bank Transfer (WPS)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="col-span-2 sm:col-span-5 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content: Grid vs Table View */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1917] rounded-2xl p-12 text-center border border-[#E7DEC8] dark:border-[#383129]">
          <Filter className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 font-serif">
            No personnel records found
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filter settings to view personnel files.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-[#FBF8F0] text-[#846429] dark:bg-[#2A2318] dark:text-[#E2C687] border border-[#ECDDBA] dark:border-[#5A451F] font-bold text-xs rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const comp = employeeComplianceMap.get(emp.id);
            const isCash = emp.salaryStructure.preferredPaymentMethod === 'Cash';

            return (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className="bg-white dark:bg-[#1C1917] rounded-2xl p-5 border border-[#E7DEC8] dark:border-[#383129] shadow-xs hover:border-[#BA9547] dark:hover:border-[#BA9547] transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.photoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'}
                        alt={emp.firstName}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#E7DEC8] dark:ring-stone-700 group-hover:ring-[#BA9547] transition"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-[#846429] dark:group-hover:text-[#E2C687] transition font-serif">
                            {emp.firstName} {emp.lastName}
                          </h3>
                        </div>
                        <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                          {emp.employment.jobTitle}
                        </p>
                        <p className="text-[11px] text-stone-400 font-mono">
                          {emp.id} • {emp.nationality}
                        </p>
                      </div>
                    </div>

                    <Badge 
                      variant={
                        emp.employment.status === 'Active' ? 'success' :
                        emp.employment.status === 'On Leave' ? 'info' : 'warning'
                      }
                      size="sm"
                    >
                      {emp.employment.status}
                    </Badge>
                  </div>

                  {/* Badges bar */}
                  <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#25201C] text-stone-700 dark:text-stone-300 border border-[#E7DEC8] dark:border-[#383129]">
                      {emp.employment.trade}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#25201C] text-stone-700 dark:text-stone-300 border border-[#E7DEC8] dark:border-[#383129]">
                      {emp.employment.department}
                    </span>
                    <Badge variant={isCash ? 'cash' : 'bank'} size="sm">
                      {isCash ? (
                        <>
                          <Banknote className="w-3 h-3" />
                          <span>Cash Payout</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3 h-3" />
                          <span>Bank WPS</span>
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Document Compliance Alert if any */}
                  {comp && (comp.hasExpired || comp.hasExpiring) && (
                    <div className="mt-3 p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold">
                        <FileWarning className="w-3.5 h-3.5 text-rose-700" />
                        {comp.hasExpired ? 'Has Expired Documents' : `${comp.urgentCount} Doc(s) Expiring Soon`}
                      </span>
                      <span className="font-bold text-rose-700">Urgent</span>
                    </div>
                  )}

                  {/* Quick Details */}
                  <div className="mt-3 pt-3 border-t border-[#E7DEC8] dark:border-[#2E2822] space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate max-w-[150px]">{emp.employment.workLocation}</span>
                      </span>
                      <span className="font-mono text-stone-800 dark:text-stone-200 font-bold">
                        AED {emp.salaryStructure.basicSalary + emp.salaryStructure.housingAllowance + emp.salaryStructure.transportAllowance}/mo
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{emp.contact.phone}</span>
                      </span>
                      <span>Labor: {emp.employment.laborCardNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-[#E7DEC8] dark:border-[#2E2822] flex items-center justify-between text-xs font-bold text-[#846429] dark:text-[#E2C687]">
                  <span>Open Dossier File</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E7DEC8] dark:border-[#383129] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#FAF7F2] dark:bg-[#25201C] text-stone-500 dark:text-stone-400 border-b border-[#E7DEC8] dark:border-[#383129] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Personnel</th>
                  <th className="py-3 px-4">ID & Trade</th>
                  <th className="py-3 px-4">Department & Site</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Compliance</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Basic Salary</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DEC8] dark:divide-[#2E2822]">
                {filteredEmployees.map((emp) => {
                  const comp = employeeComplianceMap.get(emp.id);
                  const isCash = emp.salaryStructure.preferredPaymentMethod === 'Cash';

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => onSelectEmployee(emp)}
                      className="hover:bg-[#FAF7F2] dark:hover:bg-[#25201C] cursor-pointer transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.photoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'}
                            alt={emp.firstName}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#E7DEC8] dark:ring-stone-700"
                          />
                          <div>
                            <p className="font-bold text-stone-900 dark:text-white font-serif">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[11px] text-stone-500 font-medium">
                              {emp.employment.jobTitle}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-stone-800 dark:text-stone-200">{emp.id}</p>
                        <p className="text-[11px] text-stone-500">{emp.employment.trade}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-stone-800 dark:text-stone-200 font-semibold">{emp.employment.department}</p>
                        <p className="text-[11px] text-stone-500 truncate max-w-[140px]">{emp.employment.workLocation}</p>
                      </td>

                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            emp.employment.status === 'Active' ? 'success' :
                            emp.employment.status === 'On Leave' ? 'info' : 'warning'
                          }
                          size="sm"
                        >
                          {emp.employment.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        {comp?.hasExpired ? (
                          <Badge variant="danger" size="sm">
                            Expired Docs
                          </Badge>
                        ) : comp?.hasExpiring ? (
                          <Badge variant="warning" size="sm">
                            Expiring &lt;60d
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            All Valid
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={isCash ? 'cash' : 'bank'} size="sm">
                          {isCash ? 'Cash Voucher' : 'Bank WPS'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900 dark:text-white">
                        AED {emp.salaryStructure.basicSalary.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="text-[#846429] dark:text-[#E2C687] font-bold hover:underline flex items-center justify-center gap-0.5">
                          Open Dossier <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

