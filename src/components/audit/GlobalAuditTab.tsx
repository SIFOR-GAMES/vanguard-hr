import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Download, 
  Clock, 
  User, 
  FileSpreadsheet
} from 'lucide-react';
import { AuditLog, AuditAction } from '../../types/hr';
import { Badge } from '../common/Badge';

interface GlobalAuditTabProps {
  auditLogs: AuditLog[];
}

export const GlobalAuditTab: React.FC<GlobalAuditTabProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = log.userName.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesTarget = log.targetName ? log.targetName.toLowerCase().includes(q) : false;
        if (!matchesUser && !matchesDetails && !matchesAction && !matchesTarget) return false;
      }
      return true;
    });
  }, [auditLogs, actionFilter, searchQuery]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'Log ID', 'User Name', 'Role', 'Action', 'Target Type', 'Target ID', 'Details'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      l.id,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.targetType,
      l.targetId || 'N/A',
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Royal_Office_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
      case 'DOCUMENT_UPLOAD':
        return <Badge variant="success" size="sm">{action}</Badge>;
      case 'PAYMENT':
        return <Badge variant="primary" size="sm">{action}</Badge>;
      case 'DELETE':
        return <Badge variant="danger" size="sm">{action}</Badge>;
      case 'LOGIN':
        return <Badge variant="info" size="sm">{action}</Badge>;
      case 'LEAVE_REQUEST':
      case 'LEAVE_ADJUST':
        return <Badge variant="warning" size="sm">{action}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              Official System Audit Trail & Security Log
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF5EF] dark:bg-emerald-950/60 text-[#1E683E] dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800">
              {auditLogs.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable tracking of user activities, document modifications, salary payouts, and leave adjustments.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#1E683E] dark:text-[#34D399]" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Control Bar: Search & Action Filter */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search details, user, target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E683E] text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE">CREATE</option>
            <option value="DOCUMENT_UPLOAD">DOCUMENT_UPLOAD</option>
            <option value="LEAVE_REQUEST">LEAVE_REQUEST</option>
            <option value="LEAVE_ADJUST">LEAVE_ADJUST</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Authorized User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block font-serif">{log.userName}</span>
                    <span className="text-[10px] text-slate-400">{log.userRole}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-stone-700 dark:text-stone-300">
                    {log.targetType}
                  </td>
                  <td className="py-3 px-4 text-stone-700 dark:text-stone-300 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
