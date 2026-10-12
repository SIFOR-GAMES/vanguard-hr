export type UserRole = 'Super Admin' | 'HR Manager' | 'Payroll Officer' | 'Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export type EmploymentCategory = 'Staff' | 'Labourer' | 'Technical' | 'Management';
export type EmploymentStatus = 'Active' | 'On Leave' | 'Probation' | 'Terminated' | 'Suspended';
export type ContractType = 'Unlimited' | 'Limited (2 Years)' | 'Subcontract' | 'Probation';
export type PaymentMethod = 'Cash' | 'Bank Transfer';

export interface LeaveBalanceCategory {
  total: number;
  taken: number;
  remaining: number;
}

export interface LeaveBalances {
  annual: LeaveBalanceCategory;
  sick: LeaveBalanceCategory;
  emergency: LeaveBalanceCategory;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  iban: string;
  swiftCode?: string;
}

export interface SalaryStructure {
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  foodAllowance: number;
  otherAllowance: number;
  overtimeHourlyRate: number;
  currency: string;
  preferredPaymentMethod: PaymentMethod;
  bankDetails?: BankDetails;
}

export interface Employee {
  id: string; // e.g. "EMP-1001" or "LAB-2041"
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  nationality: string;
  photoUrl?: string;
  contact: {
    phone: string;
    email: string;
    emergencyContactName: string;
    emergencyContactRelation: string;
    emergencyContactPhone: string;
    residentialAddress: string;
  };
  employment: {
    category: EmploymentCategory;
    jobTitle: string;
    trade: string; // e.g. "Electrical", "Carpentry", "Masonry", "HVAC", "Safety", "Administration"
    department: string;
    joiningDate: string;
    contractType: ContractType;
    status: EmploymentStatus;
    sponsor: string;
    workLocation: string;
    laborCardNumber: string;
    nationalIdNumber: string;
    passportNumber: string;
  };
  leaveBalances: LeaveBalances;
  salaryStructure: SalaryStructure;
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory = 
  | 'Passport'
  | 'Visa'
  | 'National ID'
  | 'Labor Card'
  | 'Medical Insurance'
  | 'Employment Contract'
  | 'Trade Certificate'
  | 'Other';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  title: string;
  category: DocumentCategory;
  documentNumber: string;
  issueDate: string;
  expiryDate: string; // YYYY-MM-DD
  fileUrl: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  notes?: string;
  verified: boolean;
  uploadedAt: string;
  uploadedBy: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Emergency';
export type LeaveStatus = 'Approved' | 'Pending' | 'Rejected' | 'Completed' | 'Cancelled';

export interface LeaveRecord {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  approvedBy?: string;
  notes?: string;
}

export type PaymentStatus = 'Paid' | 'Processing' | 'Pending';

export interface SalaryPayment {
  id: string;
  employeeId: string;
  period: string; // "October 2026"
  paymentDate: string; // Exact Day, Month, Year e.g. "2026-10-05"
  paymentMethod: PaymentMethod; // 'Cash' | 'Bank Transfer'
  basicSalary: number;
  allowances: number;
  overtimeHours: number;
  overtimePay: number;
  deductions: number;
  deductionReason?: string;
  netAmount: number;
  transactionReference: string; // Cash receipt voucher or Bank transfer ref
  status: PaymentStatus;
  paidBy: string;
  payslipUrl?: string;
  notes?: string;
  disbursedAt: string;
}

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'PAYMENT'
  | 'LOGIN'
  | 'DOCUMENT_UPLOAD'
  | 'LEAVE_REQUEST'
  | 'LEAVE_ADJUST'
  | 'RESTORE_DATA';

export type AuditTargetType = 'Employee' | 'Document' | 'Leave' | 'Salary' | 'Payment' | 'System' | 'Auth';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  targetName?: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface ExpiryStatus {
  status: 'valid' | 'expiring' | 'expired';
  daysLeft: number;
  label: string;
}
