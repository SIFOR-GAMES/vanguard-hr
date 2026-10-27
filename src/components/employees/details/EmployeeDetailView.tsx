import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  Coins, 
  CreditCard, 
  Shield, 
  Download, 
  Upload, 
  PlusCircle, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Printer, 
  FileCheck, 
  Briefcase, 
  Banknote,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { 
  Employee, 
  EmployeeDocument, 
  LeaveRecord, 
  SalaryPayment, 
  AuditLog, 
  UserRole,
  DocumentCategory,
  PaymentMethod,
  LeaveType
} from '../../../types/hr';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { getDocumentExpiryStatus } from '../../../services/storage';
import { generatePayslipPdf } from '../../../services/pdfGenerator';
import { auth } from '../../../services/auth';

interface EmployeeDetailViewProps {
  employee: Employee;
  documents: EmployeeDocument[];
  leaves: LeaveRecord[];
  payments: SalaryPayment[];
  auditLogs: AuditLog[];
  onBack: () => void;
  onUpdateEmployee: (emp: Employee) => void;
  onAddDocument: (doc: EmployeeDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onAddLeave: (leave: LeaveRecord, deduct: boolean) => void;
  onUpdateLeaveBalances: (empId: string, balances: Employee['leaveBalances']) => void;
  onAddPayment: (pay: SalaryPayment) => void;
  currentUserRole?: UserRole;
}

type DetailTab = 'overview' | 'documents' | 'leaves' | 'salary' | 'payments' | 'audit';

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  documents,
  leaves,
  payments,
  auditLogs,
  onBack,
  onUpdateEmployee,
  onAddDocument,
  onDeleteDocument,
  onAddLeave,
  onUpdateLeaveBalances,
  onAddPayment,
  currentUserRole,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  // Modals state
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isRecordLeaveOpen, setIsRecordLeaveOpen] = useState(false);
  const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<EmployeeDocument | null>(null);

  // New Document form state
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentCategory>('Passport');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [newDocIssueDate, setNewDocIssueDate] = useState('');
  const [newDocExpiryDate, setNewDocExpiryDate] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [newDocFileUrl, setNewDocFileUrl] = useState('');

  // New Leave form state
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Adjust balance form state
  const [adjAnnualTotal, setAdjAnnualTotal] = useState(employee.leaveBalances.annual.total);
  const [adjAnnualTaken, setAdjAnnualTaken] = useState(employee.leaveBalances.annual.taken);
  const [adjSickTotal, setAdjSickTotal] = useState(employee.leaveBalances.sick.total);
  const [adjSickTaken, setAdjSickTaken] = useState(employee.leaveBalances.sick.taken);
  const [adjEmergencyTotal, setAdjEmergencyTotal] = useState(employee.leaveBalances.emergency.total);
  const [adjEmergencyTaken, setAdjEmergencyTaken] = useState(employee.leaveBalances.emergency.taken);

  // New Payment form state
  const [payPeriod, setPayPeriod] = useState('October 2026');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState<PaymentMethod>(employee.salaryStructure.preferredPaymentMethod);
  const [payBasic, setPayBasic] = useState(employee.salaryStructure.basicSalary);
  const [payAllowances, setPayAllowances] = useState(
    employee.salaryStructure.housingAllowance + 
    employee.salaryStructure.transportAllowance + 
    employee.salaryStructure.foodAllowance + 
    employee.salaryStructure.otherAllowance
  );
  const [payOvertimeHours, setPayOvertimeHours] = useState(0);
  const [payDeductions, setPayDeductions] = useState(0);
  const [payDeductionReason, setPayDeductionReason] = useState('');
  const [payRef, setPayRef] = useState(
    employee.salaryStructure.preferredPaymentMethod === 'Cash' 
      ? `CASH-VOUCHER-${Math.floor(1000 + Math.random() * 9000)}` 
      : `WPS-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
  );
  const [payNotes, setPayNotes] = useState('');

  // Filtering docs for this employee
  const employeeDocs = documents.filter(d => d.employeeId === employee.id);
  const employeeLeaves = leaves.filter(l => l.employeeId === employee.id);
  const employeePayments = payments.filter(p => p.employeeId === employee.id);
  const employeeAudits = auditLogs.filter(a => a.targetId === employee.id || a.targetName?.includes(employee.firstName));

  // Handle Document Upload
  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: EmployeeDocument = {
      id: `DOC-${Date.now().toString(36).toUpperCase()}`,
      employeeId: employee.id,
      title: newDocTitle || `${newDocCategory} - ${employee.firstName}`,
      category: newDocCategory,
      documentNumber: newDocNumber || 'N/A',
      issueDate: newDocIssueDate || new Date().toISOString().split('T')[0],
      expiryDate: newDocExpiryDate,
      fileUrl: newDocFileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      fileName: `${newDocCategory.toLowerCase().replace(/\s+/g, '_')}_${employee.id}.pdf`,
      fileSize: '1.2 MB',
      mimeType: 'application/pdf',
      notes: newDocNotes,
      verified: true,
      uploadedAt: new Date().toISOString(),
      uploadedBy: auth.getCurrentUser()?.name || 'Authorized HR Staff',
    };
    onAddDocument(newDoc);
    setIsUploadDocOpen(false);
    // Reset
    setNewDocTitle('');
    setNewDocNumber('');
    setNewDocIssueDate('');
    setNewDocExpiryDate('');
    setNewDocNotes('');
    setNewDocFileUrl('');
  };

  // Handle Leave Record
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate) return;
    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave: LeaveRecord = {
      id: `LVR-${Date.now().toString(36).toUpperCase()}`,
      employeeId: employee.id,
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      durationDays,
      reason: leaveReason || 'Standard leave request',
      status: 'Approved',
      appliedAt: new Date().toISOString(),
      approvedBy: auth.getCurrentUser()?.name || 'HR Manager',
    };

    onAddLeave(newLeave, true);
    setIsRecordLeaveOpen(false);
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
  };

  // Handle Balances Adjustment
  const handleBalanceAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBalances: Employee['leaveBalances'] = {
      annual: {
        total: Number(adjAnnualTotal),
        taken: Number(adjAnnualTaken),
        remaining: Math.max(0, Number(adjAnnualTotal) - Number(adjAnnualTaken)),
      },
      sick: {
        total: Number(adjSickTotal),
        taken: Number(adjSickTaken),
        remaining: Math.max(0, Number(adjSickTotal) - Number(adjSickTaken)),
      },
      emergency: {
        total: Number(adjEmergencyTotal),
        taken: Number(adjEmergencyTaken),
        remaining: Math.max(0, Number(adjEmergencyTotal) - Number(adjEmergencyTaken)),
      },
    };
    onUpdateLeaveBalances(employee.id, updatedBalances);
    setIsAdjustBalanceOpen(false);
  };

  // Handle Salary Payment Record
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const overtimePay = payOvertimeHours * employee.salaryStructure.overtimeHourlyRate;
    const netAmount = Number(payBasic) + Number(payAllowances) + overtimePay - Number(payDeductions);

    const payment: SalaryPayment = {
      id: `PAY-${Date.now().toString(36).toUpperCase()}`,
      employeeId: employee.id,
      period: payPeriod,
      paymentDate: payDate,
      paymentMethod: payMethod,
      basicSalary: Number(payBasic),
      allowances: Number(payAllowances),
      overtimeHours: Number(payOvertimeHours),
      overtimePay,
      deductions: Number(payDeductions),
      deductionReason: payDeductionReason,
      netAmount,
      transactionReference: payRef,
      status: 'Paid',
      paidBy: auth.getCurrentUser()?.name || 'Payroll Officer',
      notes: payNotes,
      disbursedAt: new Date().toISOString(),
    };

    onAddPayment(payment);
    setIsRecordPaymentOpen(false);
  };

  // Check overall document warnings
  const urgentDocs = employeeDocs.filter(d => {
    const s = getDocumentExpiryStatus(d.expiryDate);
    return s.status === 'expired' || s.daysLeft <= 60;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-[#BA9547] dark:hover:text-[#D4AF37] transition group self-start"
        >
          <div className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 group-hover:bg-[#FAF7F2] dark:group-hover:bg-[#2A2318] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Personnel Directory</span>
        </button>

        <div className="flex items-center gap-2">
          {auth.hasPermission('manage_documents') && (
            <button
              onClick={() => setIsUploadDocOpen(true)}
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#BA9547]" />
              <span>Upload Document</span>
            </button>
          )}

          {auth.hasPermission('manage_leaves') && (
            <button
              onClick={() => setIsRecordLeaveOpen(true)}
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#BA9547]" />
              <span>Record Leave</span>
            </button>
          )}

          {auth.hasPermission('manage_payroll') && (
            <button
              onClick={() => setIsRecordPaymentOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#BA9547] hover:bg-[#A17D34] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Disburse Salary</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dossier Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Key Profile Info */}
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={employee.photoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'}
              alt={employee.firstName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {employee.firstName} {employee.lastName}
                </h1>
                <Badge variant={employee.employment.status === 'Active' ? 'success' : 'warning'}>
                  {employee.employment.status}
                </Badge>
                <Badge variant={employee.salaryStructure.preferredPaymentMethod === 'Cash' ? 'cash' : 'bank'}>
                  {employee.salaryStructure.preferredPaymentMethod === 'Cash' ? 'Cash Voucher' : 'Bank WPS'}
                </Badge>
              </div>

              <p className="text-sm font-bold text-[#088450] dark:text-[#34D399] mt-1">
                {employee.employment.jobTitle} • {employee.employment.trade}
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  ID: {employee.id}
                </span>
                <span>Nationality: {employee.nationality}</span>
                <span>Labor Card: {employee.employment.laborCardNumber}</span>
                <span>National ID: {employee.employment.nationalIdNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats on Right */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0">
            {/* Annual Leave Gauge */}
            <div className="p-3 rounded-2xl bg-[#E8F5E9] border border-emerald-200 text-center min-w-[115px]">
              <span className="text-[10px] font-bold text-[#088450] uppercase tracking-wider block">
                Yearly Off Days Left
              </span>
              <p className="text-lg font-black text-[#088450] mt-0.5 font-mono">
                {employee.leaveBalances.annual.remaining} <span className="text-xs text-slate-500 font-normal">/ {employee.leaveBalances.annual.total}d</span>
              </p>
              <span className="text-[10px] text-emerald-800 font-medium">
                {employee.leaveBalances.annual.taken}d used this year
              </span>
            </div>

            {/* Basic Salary */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Basic Salary
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                AED {employee.salaryStructure.basicSalary.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">{employee.salaryStructure.preferredPaymentMethod}</span>
            </div>

            {/* Total Documents */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Digital Docs
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {employeeDocs.length}
              </p>
              <span className={`text-[10px] font-bold ${urgentDocs.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {urgentDocs.length > 0 ? `${urgentDocs.length} Expiring` : 'All Valid'}
              </span>
            </div>
          </div>

        </div>

        {/* Tab Navigation Menu */}
        <div className="mt-8 border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto gap-2 -mb-px">
          {[
            { id: 'overview' as DetailTab, label: 'Profile Dossier', icon: User },
            { 
              id: 'documents' as DetailTab, 
              label: 'Employee Documents', 
              icon: FileText, 
              badge: employeeDocs.length 
            },
            { 
              id: 'leaves' as DetailTab, 
              label: 'Leave Balances', 
              icon: Calendar, 
              badge: `${employee.leaveBalances.annual.remaining}d` 
            },
            { 
              id: 'salary' as DetailTab, 
              label: 'Salary & Payslips', 
              icon: Coins 
            },
            { 
              id: 'payments' as DetailTab, 
              label: 'Payment Tracking', 
              icon: CreditCard,
              badge: employeePayments.length
            },
            { 
              id: 'audit' as DetailTab, 
              label: 'Modification Audit', 
              icon: Shield 
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#088450] text-[#088450] dark:text-[#34D399] dark:border-[#34D399]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#E8F5E9] text-[#088450] dark:bg-emerald-950/60 dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. OVERVIEW DOSSIER TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employment & Assignment */}
          <div className="card-uae rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Briefcase className="w-4 h-4 text-[#088450] dark:text-[#34D399]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Employment & Work Assignment
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 font-medium">Category</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{employee.employment.category}</p>
              </div>
              <div>
                <span className="text-stone-400 font-medium">Department</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{employee.employment.department}</p>
              </div>
              <div>
                <span className="text-stone-400 font-medium">Designation / Title</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{employee.employment.jobTitle}</p>
              </div>
              <div>
                <span className="text-stone-400 font-medium">Trade Specialization</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{employee.employment.trade}</p>
              </div>
              <div>
                <span className="text-stone-400 font-medium">Joining Date</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 font-mono mt-0.5">{employee.employment.joiningDate}</p>
              </div>
              <div>
                <span className="text-stone-400 font-medium">Contract Type</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{employee.employment.contractType}</p>
              </div>
              <div>
                <span className="text-stone-400 font-medium">Official Sponsor</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{employee.employment.sponsor}</p>
              </div>
              <div>
                <span className="text-stone-400 font-medium">Work Site / Project</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#BA9547]" />
                  {employee.employment.workLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Details & Emergency Contact */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Phone className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Contact & Emergency Information
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Mobile Number</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  {employee.contact.phone}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Email Address</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{employee.contact.email}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date of Birth / Gender</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{employee.dateOfBirth} ({employee.gender})</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Passport Number</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">{employee.employment.passportNumber}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-medium">Camp / Residential Address</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{employee.contact.residentialAddress}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                  Next of Kin / Emergency Contact
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-xs mt-1">
                  {employee.contact.emergencyContactName} ({employee.contact.emergencyContactRelation})
                </p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {employee.contact.emergencyContactPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Yearly Off Days & Leave Summary Card */}
          <div className="md:col-span-2 card-uae rounded-2xl p-6 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#088450]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Yearly Off Days &amp; Leave Entitlement
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('leaves')}
                className="text-xs font-bold text-[#088450] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Manage Off Days &amp; History</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#E8F5E9]/70 border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#088450] uppercase tracking-wider">
                    Yearly Off Days Left
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    Total: {employee.leaveBalances.annual.total}d / yr
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#088450] font-mono">
                    {employee.leaveBalances.annual.remaining}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">days left</span>
                </div>
                <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-emerald-200">
                  <div
                    className="bg-[#088450] h-full rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, (employee.leaveBalances.annual.remaining / (employee.leaveBalances.annual.total || 30)) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                  {employee.leaveBalances.annual.taken} days used • {employee.leaveBalances.annual.remaining} days remaining
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Sick Leave Left
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    Total: {employee.leaveBalances.sick.total}d
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {employee.leaveBalances.sick.remaining}
                  </span>
                  <span className="text-xs text-slate-500">days left</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {employee.leaveBalances.sick.taken} days used
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Emergency Off Days Left
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    Total: {employee.leaveBalances.emergency.total}d
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {employee.leaveBalances.emergency.remaining}
                  </span>
                  <span className="text-xs text-slate-500">days left</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {employee.leaveBalances.emergency.taken} days used
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EMPLOYEE DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Individual Document Repository
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Passports, residence visas, Emirates ID, labor contracts, and medical insurance.
              </p>
            </div>

            {auth.hasPermission('manage_documents') && (
              <button
                onClick={() => setIsUploadDocOpen(true)}
                className="px-4 py-2 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Document</span>
              </button>
            )}
          </div>

          {employeeDocs.length === 0 ? (
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No documents in file</p>
              <p className="text-xs text-slate-500 mt-1">Upload the employee’s passport, visa, or labor card to begin tracking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employeeDocs.map((doc) => {
                const status = getDocumentExpiryStatus(doc.expiryDate);
                const isExpired = status.status === 'expired';
                const isExpiring = status.status === 'expiring';

                return (
                  <div
                    key={doc.id}
                    className="card-uae rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-[#088450]/60 dark:hover:border-[#34D399]/50 transition"
                  >
                    <div>
                      {/* Top Bar with Category & Expiry Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#088450] dark:bg-emerald-950/60 dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800">
                          {doc.category}
                        </span>
                        <Badge variant={isExpired ? 'danger' : isExpiring ? 'warning' : 'success'} size="sm">
                          {status.label}
                        </Badge>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-3">
                        {doc.title}
                      </h4>

                      <div className="mt-2 space-y-1 text-xs text-stone-500 dark:text-stone-400">
                        <p className="font-mono">Doc #: <span className="font-bold text-stone-800 dark:text-stone-200">{doc.documentNumber}</span></p>
                        <p>Issue Date: <span className="font-mono">{doc.issueDate || 'N/A'}</span></p>
                        <p>Expiry Date: <span className={`font-mono font-bold ${isExpired ? 'text-rose-600' : isExpiring ? 'text-amber-600' : 'text-stone-700 dark:text-stone-300'}`}>{doc.expiryDate}</span></p>
                        {doc.notes && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 italic bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200 dark:border-amber-900 mt-2">
                            {doc.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-400">
                        {doc.fileSize} • {doc.fileName.split('.').pop()?.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#BA9547] hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={doc.fileUrl}
                          download={doc.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#BA9547] hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {auth.hasPermission('delete_records') && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete document "${doc.title}"?`)) {
                                onDeleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. LEAVE BALANCES TAB */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Three Tier Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Annual Leave */}
            <div className="card-uae p-5 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#088450] uppercase tracking-wider">
                  Yearly Off Days Left
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Entitlement: {employee.leaveBalances.annual.total}d / yr
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#088450] font-mono">
                  {employee.leaveBalances.annual.remaining}
                </span>
                <span className="text-xs font-semibold text-slate-500">days left</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#088450] h-full" 
                  style={{ width: `${Math.min(100, (employee.leaveBalances.annual.remaining / employee.leaveBalances.annual.total) * 100)}%` }} 
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {employee.leaveBalances.annual.taken} days used • {employee.leaveBalances.annual.remaining} days remaining
              </p>
            </div>

            {/* Sick Leave */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Sick Leave
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Allocation: {employee.leaveBalances.sick.total}d
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {employee.leaveBalances.sick.remaining}
                </span>
                <span className="text-xs text-slate-500">days available</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full" 
                  style={{ width: `${Math.min(100, (employee.leaveBalances.sick.taken / employee.leaveBalances.sick.total) * 100)}%` }} 
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {employee.leaveBalances.sick.taken} days taken (medical certificate verified)
              </p>
            </div>

            {/* Emergency Leave */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Emergency Leave
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Allocation: {employee.leaveBalances.emergency.total}d
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {employee.leaveBalances.emergency.remaining}
                </span>
                <span className="text-xs text-slate-500">days available</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${Math.min(100, (employee.leaveBalances.emergency.taken / employee.leaveBalances.emergency.total) * 100)}%` }} 
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {employee.leaveBalances.emergency.taken} days taken for urgent personal matters
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Leave History & Review</h4>
              <p className="text-xs text-slate-500">Chronological history of leaves taken, dates, and durations.</p>
            </div>

            <div className="flex items-center gap-2">
              {auth.hasPermission('manage_leaves') && (
                <>
                  <button
                    onClick={() => setIsAdjustBalanceOpen(true)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Adjust Balances</span>
                  </button>
                  <button
                    onClick={() => setIsRecordLeaveOpen(true)}
                    className="px-4 py-2 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Record New Leave</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Leave History Table */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E7DEC8] dark:border-[#3D352E] overflow-hidden shadow-xs">
            {employeeLeaves.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No leave records registered for this employee.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#FAF7F2] dark:bg-[#1E1B18] text-[#846429] dark:text-[#E7DEC8] font-bold uppercase tracking-wider text-[10px] border-b border-[#E7DEC8] dark:border-[#3D352E]">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {employeeLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-white">
                        {l.leaveType} Leave
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600 dark:text-stone-300">
                        {l.startDate} → {l.endDate}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#846429] dark:text-[#D4AF37]">
                        {l.durationDays} day(s)
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                        {l.reason}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={l.status === 'Completed' || l.status === 'Approved' ? 'success' : 'warning'} size="sm">
                          {l.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {l.approvedBy || 'HR Staff'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 4. SALARY & PAYROLL RECORDS TAB */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          {/* Salary Structure Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Compensation & Salary Structure
                </h3>
                <p className="text-xs text-slate-500">
                  Fixed monthly wage entitlements, allowances, and preferred payment route.
                </p>
              </div>

              <Badge variant={employee.salaryStructure.preferredPaymentMethod === 'Cash' ? 'cash' : 'bank'}>
                {employee.salaryStructure.preferredPaymentMethod === 'Cash' ? '💵 Cash Disbursement' : '🏦 Bank Transfer (WPS)'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-medium">Basic Wage</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
                  AED {employee.salaryStructure.basicSalary.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-medium">Housing Allowance</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
                  AED {employee.salaryStructure.housingAllowance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-medium">Transport Allowance</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
                  AED {employee.salaryStructure.transportAllowance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-medium">Food & Other</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
                  AED {(employee.salaryStructure.foodAllowance + employee.salaryStructure.otherAllowance).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Bank details if Bank transfer */}
            {employee.salaryStructure.preferredPaymentMethod === 'Bank Transfer' && employee.salaryStructure.bankDetails && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs space-y-1">
                <p className="font-bold text-blue-900 dark:text-blue-200">
                  Bank Account (WPS Registered)
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  {employee.salaryStructure.bankDetails.bankName} • Acc: {employee.salaryStructure.bankDetails.accountNumber}
                </p>
                <p className="text-blue-700 dark:text-blue-300 font-mono">
                  IBAN: {employee.salaryStructure.bankDetails.iban}
                </p>
              </div>
            )}
          </div>

          {/* Payslips & Payment History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Salary Slips & Historical Payslips
                </h3>
                <p className="text-xs text-slate-500">
                  Generate branded PDF payslips or view historical payment records.
                </p>
              </div>

              {auth.hasPermission('manage_payroll') && (
                <button
                  onClick={() => setIsRecordPaymentOpen(true)}
                  className="px-4 py-2 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Record Salary Period</span>
                </button>
              )}
            </div>

            {employeePayments.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No salary disbursement slips logged for this employee.
              </div>
            ) : (
              <div className="space-y-3">
                {employeePayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Payslip for {p.period}
                        </h4>
                        <Badge variant={p.paymentMethod === 'Cash' ? 'cash' : 'bank'} size="sm">
                          {p.paymentMethod}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span>Paid on: <strong className="font-mono text-slate-700 dark:text-slate-300">{p.paymentDate}</strong></span>
                        <span>Voucher / Ref: <strong className="font-mono text-slate-700 dark:text-slate-300">{p.transactionReference}</strong></span>
                        {p.overtimeHours > 0 && <span>OT: {p.overtimeHours} hrs (AED {p.overtimePay})</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Net Payout</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          AED {p.netAmount.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => generatePayslipPdf(employee, p)}
                        className="px-3 py-2 bg-[#E8F5E9] dark:bg-emerald-950/60 hover:bg-[#d4edd8] text-[#088450] dark:text-[#34D399] font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Download PDF Payslip</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SALARY PAYMENT TRACKING LEDGER TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="card-uae p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detailed Salary Payment Tracking
              </h3>
              <p className="text-xs text-slate-500">
                Payment method (Cash vs Bank), exact payment dates (Day, Month, Year), amounts, and audit vouchers.
              </p>
            </div>

            {auth.hasPermission('manage_payroll') && (
              <button
                onClick={() => setIsRecordPaymentOpen(true)}
                className="px-4 py-2 bg-[#088450] hover:bg-[#066e42] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {employeePayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No salary payments logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Exact Payment Date</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Voucher / Transaction Ref</th>
                      <th className="py-3 px-4">Basic + Allowances</th>
                      <th className="py-3 px-4">Deductions</th>
                      <th className="py-3 px-4 text-right">Net Amount Paid</th>
                      <th className="py-3 px-4 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employeePayments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40">
                        <td className="py-3 px-4 font-bold text-stone-900 dark:text-white">
                          {p.period}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">
                          {p.paymentDate}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={p.paymentMethod === 'Cash' ? 'cash' : 'bank'} size="sm">
                            {p.paymentMethod === 'Cash' ? 'Cash Voucher' : 'Bank Transfer'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600 dark:text-stone-400">
                          {p.transactionReference}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300 font-mono">
                          AED {(p.basicSalary + p.allowances + p.overtimePay).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-rose-600 font-mono">
                          {p.deductions > 0 ? `-AED ${p.deductions.toLocaleString()}` : '0.00'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-stone-900 dark:text-white text-sm">
                          AED {p.netAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => generatePayslipPdf(employee, p)}
                            className="text-[#BA9547] dark:text-[#D4AF37] font-bold hover:underline"
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MODIFICATION AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#E7DEC8] dark:border-[#3D352E] shadow-xs space-y-4">
          <div className="border-b border-[#E7DEC8]/60 dark:border-[#3D352E] pb-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Employee File Audit Log
            </h3>
            <p className="text-xs text-stone-500">
              Immutable history of updates, document uploads, leave approvals, and salary payouts.
            </p>
          </div>

          {employeeAudits.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">No specific events recorded for this file.</p>
          ) : (
            <div className="space-y-3">
              {employeeAudits.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E7DEC8] dark:border-[#3D352E] text-xs flex items-start gap-3"
                >
                  <div className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#2A2318] text-[#846429] dark:text-[#D4AF37] border border-[#E7DEC8]/60 dark:border-[#3D352E] font-bold shrink-0">
                    {a.action}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {a.userName} ({a.userRole})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(a.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{a.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: UPLOAD NEW DOCUMENT */}
      <Modal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        title="Upload Employee Document"
        subtitle={`Add a new file to ${employee.firstName} ${employee.lastName}'s digital dossier`}
      >
        <form onSubmit={handleDocSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Document Category
              </label>
              <select
                value={newDocCategory}
                onChange={(e) => setNewDocCategory(e.target.value as DocumentCategory)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Passport">Passport</option>
                <option value="Visa">Residence Visa</option>
                <option value="National ID">Emirates ID / National ID</option>
                <option value="Labor Card">Labor Card / Work Permit</option>
                <option value="Medical Insurance">Medical Insurance</option>
                <option value="Employment Contract">Employment Contract</option>
                <option value="Trade Certificate">Trade / Safety Certificate</option>
                <option value="Other">Other Document</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Document Title
              </label>
              <input
                type="text"
                placeholder="e.g. UAE Residence Visa Page"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Document / ID Number
              </label>
              <input
                type="text"
                placeholder="e.g. 784-1990-1234567-1"
                value={newDocNumber}
                onChange={(e) => setNewDocNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Expiry Date (Critical for Alerts)
              </label>
              <input
                type="date"
                required
                value={newDocExpiryDate}
                onChange={(e) => setNewDocExpiryDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={newDocIssueDate}
                onChange={(e) => setNewDocIssueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                File Image / PDF URL
              </label>
              <input
                type="url"
                placeholder="https://... or sample"
                value={newDocFileUrl}
                onChange={(e) => setNewDocFileUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 text-xs">
              Special Notes / Compliance Remarks
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Renewal submitted to immigration office..."
              value={newDocNotes}
              onChange={(e) => setNewDocNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsUploadDocOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save to Digital File
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECORD LEAVE */}
      <Modal
        isOpen={isRecordLeaveOpen}
        onClose={() => setIsRecordLeaveOpen(false)}
        title="Record Leave Request"
        subtitle={`Log leave dates for ${employee.firstName} ${employee.lastName}`}
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Leave Category
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Annual">Annual Leave ({employee.leaveBalances.annual.remaining}d remaining)</option>
                <option value="Sick">Sick Leave ({employee.leaveBalances.sick.remaining}d remaining)</option>
                <option value="Emergency">Emergency Leave ({employee.leaveBalances.emergency.remaining}d remaining)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                End Date (Inclusive)
              </label>
              <input
                type="date"
                required
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Reason / Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Annual home visit to India, medical rest, etc."
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordLeaveOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Approve & Deduct Balance
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADJUST LEAVE BALANCES */}
      <Modal
        isOpen={isAdjustBalanceOpen}
        onClose={() => setIsAdjustBalanceOpen(false)}
        title="Adjust Leave Balances"
        subtitle="Manually update allocated or taken balance counts"
      >
        <form onSubmit={handleBalanceAdjustSubmit} className="space-y-4 text-xs">
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-[#846429] dark:text-[#D4AF37] uppercase block mb-2">Annual Leave</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Total Allocated</label>
                  <input
                    type="number"
                    value={adjAnnualTotal}
                    onChange={(e) => setAdjAnnualTotal(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Days Taken</label>
                  <input
                    type="number"
                    value={adjAnnualTaken}
                    onChange={(e) => setAdjAnnualTaken(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-emerald-600 uppercase block mb-2">Sick Leave</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Total Allocated</label>
                  <input
                    type="number"
                    value={adjSickTotal}
                    onChange={(e) => setAdjSickTotal(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Days Taken</label>
                  <input
                    type="number"
                    value={adjSickTaken}
                    onChange={(e) => setAdjSickTaken(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-amber-600 uppercase block mb-2">Emergency Leave</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Total Allocated</label>
                  <input
                    type="number"
                    value={adjEmergencyTotal}
                    onChange={(e) => setAdjEmergencyTotal(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Days Taken</label>
                  <input
                    type="number"
                    value={adjEmergencyTaken}
                    onChange={(e) => setAdjEmergencyTaken(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdjustBalanceOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save New Balances
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECORD SALARY PAYMENT */}
      <Modal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        title="Disburse & Record Salary Payment"
        subtitle={`Generate a payment record & payslip for ${employee.firstName} ${employee.lastName}`}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Payment Period
              </label>
              <input
                type="text"
                required
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
                placeholder="e.g. October 2026"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Exact Payment Date
              </label>
              <input
                type="date"
                required
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Payment Method
              </label>
              <select
                value={payMethod}
                onChange={(e) => {
                  const m = e.target.value as PaymentMethod;
                  setPayMethod(m);
                  setPayRef(m === 'Cash' ? `CASH-VOUCHER-${Math.floor(1000 + Math.random() * 9000)}` : `WPS-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="Cash">Cash Payment (Receipt Voucher)</option>
                <option value="Bank Transfer">Bank Transfer (WPS)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Voucher / Reference No.
              </label>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Basic Salary (AED)
              </label>
              <input
                type="number"
                value={payBasic}
                onChange={(e) => setPayBasic(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Allowances Total (AED)
              </label>
              <input
                type="number"
                value={payAllowances}
                onChange={(e) => setPayAllowances(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Overtime Hours ({employee.salaryStructure.overtimeHourlyRate} AED/hr)
              </label>
              <input
                type="number"
                value={payOvertimeHours}
                onChange={(e) => setPayOvertimeHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Deductions / Advances (AED)
              </label>
              <input
                type="number"
                value={payDeductions}
                onChange={(e) => setPayDeductions(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          {/* Net Calculation Summary */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
            <span className="font-bold text-emerald-800 dark:text-emerald-200">
              Calculated Net Salary:
            </span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
              AED {(Number(payBasic) + Number(payAllowances) + (payOvertimeHours * employee.salaryStructure.overtimeHourlyRate) - Number(payDeductions)).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordPaymentOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Confirm Disbursement & Save
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW DOCUMENT PREVIEW */}
      {viewingDoc && (
        <Modal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          title={viewingDoc.title}
          subtitle={`Category: ${viewingDoc.category} • Expiry: ${viewingDoc.expiryDate}`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 max-h-[60vh] flex items-center justify-center">
              <img
                src={viewingDoc.fileUrl}
                alt={viewingDoc.title}
                className="max-h-[55vh] object-contain w-full"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <div className="text-slate-500">
                <span>Document Number: <strong className="font-mono text-slate-800 dark:text-slate-200">{viewingDoc.documentNumber}</strong></span>
              </div>
              <a
                href={viewingDoc.fileUrl}
                download={viewingDoc.fileName}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
