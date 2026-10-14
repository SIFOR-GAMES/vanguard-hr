import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Employee, EmployeeDocument } from '../../types/hr';
import { getDocumentExpiryStatus } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface ComplianceTabProps {
  employees: Employee[];
  documents: EmployeeDocument[];
  onSelectEmployee: (employee: Employee) => void;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({
  employees,
  documents,
  onSelectEmployee,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'EXPIRED' | 'EXPIRING_30' | 'EXPIRING_60' | 'VALID'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);

  // Map employee lookup
  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach(e => map.set(e.id, e));
    return map;
  }, [employees]);

  // Enriched documents with status
  const enrichedDocs = useMemo(() => {
    return documents.map(doc => {
      const emp = employeeMap.get(doc.employeeId);
      const expiry = getDocumentExpiryStatus(doc.expiryDate);
      return {
        ...doc,
        employee: emp,
        expiryStatus: expiry,
      };
    });
  }, [documents, employeeMap]);

  // Statistics
  const expiredCount = enrichedDocs.filter(d => d.expiryStatus.status === 'expired').length;
  const expiring30Count = enrichedDocs.filter(d => d.expiryStatus.status === 'expiring' && d.expiryStatus.daysLeft <= 30 && d.expiryStatus.daysLeft >= 0).length;
  const expiring60Count = enrichedDocs.filter(d => d.expiryStatus.status === 'expiring' && d.expiryStatus.daysLeft > 30 && d.expiryStatus.daysLeft <= 60).length;
  const validCount = enrichedDocs.filter(d => d.expiryStatus.status === 'valid').length;

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return enrichedDocs.filter(d => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = d.title.toLowerCase().includes(q);
        const matchesDocNum = d.documentNumber.toLowerCase().includes(q);
        const matchesEmp = d.employee ? `${d.employee.firstName} ${d.employee.lastName} ${d.employee.id}`.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesDocNum && !matchesEmp) return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && d.category !== categoryFilter) return false;

      // Status
      if (filterType === 'EXPIRED') return d.expiryStatus.status === 'expired';
      if (filterType === 'EXPIRING_30') return d.expiryStatus.status === 'expiring' && d.expiryStatus.daysLeft <= 30 && d.expiryStatus.daysLeft >= 0;
      if (filterType === 'EXPIRING_60') return d.expiryStatus.daysLeft > 30 && d.expiryStatus.daysLeft <= 60;
      if (filterType === 'VALID') return d.expiryStatus.status === 'valid';

      return true;
    }).sort((a, b) => a.expiryStatus.daysLeft - b.expiryStatus.daysLeft);
  }, [enrichedDocs, searchQuery, categoryFilter, filterType]);

  const exportCsv = () => {
    const headers = ['Employee ID', 'Employee Name', 'Document Title', 'Category', 'Doc Number', 'Issue Date', 'Expiry Date', 'Days Left', 'Status'];
    const rows = filteredDocs.map(d => [
      d.employee?.id || d.employeeId,
      d.employee ? `"${d.employee.firstName} ${d.employee.lastName}"` : 'Unknown',
      `"${d.title}"`,
      d.category,
      d.documentNumber,
      d.issueDate,
      d.expiryDate,
      d.expiryStatus.daysLeft,
      d.expiryStatus.status.toUpperCase(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Royal_Office_Document_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Document Compliance & Expiry Tracking
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {expiredCount + expiring30Count} Urgent Actions
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time validity auditing for Passports, Visas, Emirates IDs, Work Permits & Medical Cards.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#1C1917] hover:bg-[#FAF7F2] dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto border border-[#E7DEC8] dark:border-[#383129]"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Export Compliance CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterType(filterType === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterType === 'EXPIRED'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-[#1C1917] border-[#E7DEC8] dark:border-[#383129] hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Expired Documents
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-700" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-2 font-mono">
            {expiredCount}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Requires immediate renewal</p>
        </div>

        <div 
          onClick={() => setFilterType(filterType === 'EXPIRING_30' ? 'ALL' : 'EXPIRING_30')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterType === 'EXPIRING_30'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-[#1C1917] border-[#E7DEC8] dark:border-[#383129] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              Expiring &lt; 30 Days
            </span>
            <Clock className="w-4 h-4 text-amber-800" />
          </div>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-400 mt-2 font-mono">
            {expiring30Count}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Submit renewal papers</p>
        </div>

        <div 
          onClick={() => setFilterType(filterType === 'EXPIRING_60' ? 'ALL' : 'EXPIRING_60')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterType === 'EXPIRING_60'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Expiring 31–60 Days
            </span>
            <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-2 font-mono">
            {expiring60Count}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Upcoming renewals queue</p>
        </div>

        <div 
          onClick={() => setFilterType(filterType === 'VALID' ? 'ALL' : 'VALID')}
          className={`card-uae p-4 rounded-2xl border transition cursor-pointer ${
            filterType === 'VALID'
              ? 'bg-[#E8F5E9] dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 ring-2 ring-[#088450]/20'
              : 'bg-white dark:bg-[#0F172A] border-slate-200/80 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#088450] dark:text-[#34D399] uppercase tracking-wider">
              Fully Compliant
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#088450] dark:text-[#34D399]" />
          </div>
          <p className="text-2xl font-black text-[#088450] dark:text-[#34D399] mt-2 font-mono">
            {validCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">&gt; 60 days validity remaining</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search document title, ID, employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#088450] text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="ALL">All Categories</option>
            <option value="Passport">Passport</option>
            <option value="Visa">Residence Visa</option>
            <option value="National ID">Emirates ID</option>
            <option value="Labor Card">Labor Card</option>
            <option value="Medical Insurance">Medical Insurance</option>
            <option value="Trade Certificate">Trade / Safety Certificate</option>
          </select>

          {filterType !== 'ALL' && (
            <button
              onClick={() => setFilterType('ALL')}
              className="font-bold text-[#088450] dark:text-[#34D399] hover:underline cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Compliance Master Ledger Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Personnel</th>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Document / Permit #</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Days Left</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.map((doc) => {
                const isExpired = doc.expiryStatus.status === 'expired';
                const isExpiring = doc.expiryStatus.status === 'expiring';

                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                  >
                    <td className="py-3 px-4">
                      {doc.employee ? (
                        <div 
                          onClick={() => onSelectEmployee(doc.employee!)}
                          className="cursor-pointer group"
                        >
                          <p className="font-bold text-slate-900 group-hover:text-[#088450] transition">
                            {doc.employee.firstName} {doc.employee.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {doc.employee.id} • {doc.employee.employment.trade}
                          </p>
                        </div>
                      ) : (
                        <span className="font-mono text-slate-400">{doc.employeeId}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {doc.title}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {doc.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {doc.documentNumber}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {doc.expiryDate}
                    </td>

                    <td className="py-3 px-4 font-bold">
                      <span className={isExpired ? 'text-rose-700 dark:text-rose-400' : isExpiring ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>
                        {doc.expiryStatus.daysLeft < 0 ? `${Math.abs(doc.expiryStatus.daysLeft)}d overdue` : `${doc.expiryStatus.daysLeft} days`}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={isExpired ? 'danger' : isExpiring ? 'warning' : 'success'} size="sm">
                        {doc.expiryStatus.label}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1 rounded-lg text-slate-400 hover:text-[#088450] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {doc.employee && (
                          <button
                            onClick={() => onSelectEmployee(doc.employee!)}
                            className="p-1 rounded-lg text-[#088450] dark:text-[#34D399] hover:bg-[#E8F5E9] dark:hover:bg-emerald-950 font-bold text-[11px] flex items-center cursor-pointer"
                            title="Open dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PREVIEW */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          subtitle={`Doc Number: ${previewDoc.documentNumber} • Expiry: ${previewDoc.expiryDate}`}
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[60vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900">
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.title}
                className="max-h-[55vh] object-contain w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <a
                href={previewDoc.fileUrl}
                download={previewDoc.fileName}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#088450] hover:bg-[#066e42] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
