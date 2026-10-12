import { Employee, EmployeeDocument, LeaveRecord, SalaryPayment, AuditLog, ExpiryStatus } from '../types/hr';
import { INITIAL_EMPLOYEES, INITIAL_DOCUMENTS, INITIAL_LEAVE_RECORDS, INITIAL_PAYMENTS, INITIAL_AUDIT_LOGS } from '../data/seedData';

const KEYS = {
  EMPLOYEES: 'vanguard_hr_employees',
  DOCUMENTS: 'vanguard_hr_documents',
  LEAVES: 'vanguard_hr_leaves',
  PAYMENTS: 'vanguard_hr_payments',
  AUDIT_LOGS: 'vanguard_hr_audit_logs',
};

// Expiry calculation relative to current date
export function getDocumentExpiryStatus(expiryDateStr: string): ExpiryStatus {
  if (!expiryDateStr) {
    return { status: 'valid', daysLeft: 999, label: 'No Expiry' };
  }

  const expiry = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: 'expired',
      daysLeft,
      label: `Expired ${Math.abs(daysLeft)}d ago`,
    };
  } else if (daysLeft <= 30) {
    return {
      status: 'expiring',
      daysLeft,
      label: `Urgent: ${daysLeft}d left`,
    };
  } else if (daysLeft <= 60) {
    return {
      status: 'expiring',
      daysLeft,
      label: `Expiring in ${daysLeft}d`,
    };
  }

  return {
    status: 'valid',
    daysLeft,
    label: `Valid (${daysLeft}d left)`,
  };
}

class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(KEYS.EMPLOYEES)) {
      localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    }
    if (!localStorage.getItem(KEYS.DOCUMENTS)) {
      localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    }
    if (!localStorage.getItem(KEYS.LEAVES)) {
      localStorage.setItem(KEYS.LEAVES, JSON.stringify(INITIAL_LEAVE_RECORDS));
    }
    if (!localStorage.getItem(KEYS.PAYMENTS)) {
      localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    }
    if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
  }

  // --- Employees ---
  getEmployees(): Employee[] {
    try {
      const data = localStorage.getItem(KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.getEmployees().find(e => e.id === id);
  }

  saveEmployee(employee: Employee): void {
    const list = this.getEmployees();
    const index = list.findIndex(e => e.id === employee.id);
    if (index >= 0) {
      list[index] = { ...employee, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...employee, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(list));
  }

  deleteEmployee(id: string): void {
    const list = this.getEmployees().filter(e => e.id !== id);
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(list));
    // Also cleanup cascade or keep for audit
  }

  // --- Documents ---
  getDocuments(employeeId?: string): EmployeeDocument[] {
    try {
      const data = localStorage.getItem(KEYS.DOCUMENTS);
      const docs: EmployeeDocument[] = data ? JSON.parse(data) : INITIAL_DOCUMENTS;
      if (employeeId) {
        return docs.filter(d => d.employeeId === employeeId);
      }
      return docs;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  }

  saveDocument(doc: EmployeeDocument): void {
    const list = this.getDocuments();
    const index = list.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      list[index] = doc;
    } else {
      list.unshift(doc);
    }
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(list));
  }

  deleteDocument(id: string): void {
    const list = this.getDocuments().filter(d => d.id !== id);
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(list));
  }

  // --- Leave Records & Balance Management ---
  getLeaves(employeeId?: string): LeaveRecord[] {
    try {
      const data = localStorage.getItem(KEYS.LEAVES);
      const leaves: LeaveRecord[] = data ? JSON.parse(data) : INITIAL_LEAVE_RECORDS;
      if (employeeId) {
        return leaves.filter(l => l.employeeId === employeeId);
      }
      return leaves;
    } catch {
      return INITIAL_LEAVE_RECORDS;
    }
  }

  saveLeave(leave: LeaveRecord, deductBalance = true): void {
    const list = this.getLeaves();
    const existingIndex = list.findIndex(l => l.id === leave.id);
    
    // If deductBalance is requested and it's approved or completed, update employee balance
    if (deductBalance && (leave.status === 'Approved' || leave.status === 'Completed')) {
      const emp = this.getEmployeeById(leave.employeeId);
      if (emp) {
        const typeKey = leave.leaveType.toLowerCase() as 'annual' | 'sick' | 'emergency';
        if (emp.leaveBalances[typeKey]) {
          const currentTaken = emp.leaveBalances[typeKey].taken;
          const newTaken = currentTaken + leave.durationDays;
          emp.leaveBalances[typeKey].taken = newTaken;
          emp.leaveBalances[typeKey].remaining = Math.max(0, emp.leaveBalances[typeKey].total - newTaken);
          this.saveEmployee(emp);
        }
      }
    }

    if (existingIndex >= 0) {
      list[existingIndex] = leave;
    } else {
      list.unshift(leave);
    }
    localStorage.setItem(KEYS.LEAVES, JSON.stringify(list));
  }

  updateEmployeeLeaveBalances(employeeId: string, balances: Employee['leaveBalances']): void {
    const emp = this.getEmployeeById(employeeId);
    if (emp) {
      emp.leaveBalances = balances;
      this.saveEmployee(emp);
    }
  }

  deleteLeave(id: string): void {
    const list = this.getLeaves().filter(l => l.id !== id);
    localStorage.setItem(KEYS.LEAVES, JSON.stringify(list));
  }

  // --- Salary & Payments ---
  getPayments(employeeId?: string): SalaryPayment[] {
    try {
      const data = localStorage.getItem(KEYS.PAYMENTS);
      const payments: SalaryPayment[] = data ? JSON.parse(data) : INITIAL_PAYMENTS;
      if (employeeId) {
        return payments.filter(p => p.employeeId === employeeId);
      }
      return payments;
    } catch {
      return INITIAL_PAYMENTS;
    }
  }

  savePayment(payment: SalaryPayment): void {
    const list = this.getPayments();
    const index = list.findIndex(p => p.id === payment.id);
    if (index >= 0) {
      list[index] = payment;
    } else {
      list.unshift(payment);
    }
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(list));
  }

  deletePayment(id: string): void {
    const list = this.getPayments().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(list));
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const list = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...entry,
      id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newEntry);
    // keep max 500 audit entries
    if (list.length > 500) list.pop();
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(list));
  }

  // --- Backup & Restore ---
  exportBackup(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      employees: this.getEmployees(),
      documents: this.getDocuments(),
      leaves: this.getLeaves(),
      payments: this.getPayments(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackup(jsonString: string): boolean {
    try {
      const backup = JSON.parse(jsonString);
      if (backup.employees && Array.isArray(backup.employees)) {
        localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(backup.employees));
        localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(backup.documents || []));
        localStorage.setItem(KEYS.LEAVES, JSON.stringify(backup.leaves || []));
        localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(backup.payments || []));
        localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(backup.auditLogs || []));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  resetToDefault(): void {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    localStorage.setItem(KEYS.LEAVES, JSON.stringify(INITIAL_LEAVE_RECORDS));
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }
}

export const storage = new StorageService();
