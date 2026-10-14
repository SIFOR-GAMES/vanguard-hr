import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  EmployeeDocument, 
  LeaveRecord, 
  SalaryPayment, 
  AuditLog, 
  User, 
  UserRole 
} from './types/hr';
import { storage, getDocumentExpiryStatus } from './services/storage';
import { auth } from './services/auth';

import { Navbar } from './components/common/Navbar';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { LoginModal } from './components/auth/LoginModal';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { EmployeeList } from './components/employees/EmployeeList';
import { EmployeeDetailView } from './components/employees/details/EmployeeDetailView';
import { AddEmployeeModal } from './components/employees/AddEmployeeModal';
import { ComplianceTab } from './components/compliance/ComplianceTab';
import { PayrollCenterTab } from './components/payroll/PayrollCenterTab';
import { GlobalAuditTab } from './components/audit/GlobalAuditTab';

export const App: React.FC = () => {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.getCurrentUser());
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Layout & Theme
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('vanguard_theme') === 'dark';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data State
  const [employees, setEmployees] = useState<Employee[]>(() => storage.getEmployees());
  const [documents, setDocuments] = useState<EmployeeDocument[]>(() => storage.getDocuments());
  const [leaves, setLeaves] = useState<LeaveRecord[]>(() => storage.getLeaves());
  const [payments, setPayments] = useState<SalaryPayment[]>(() => storage.getPayments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vanguard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vanguard_theme', 'light');
    }
  }, [darkMode]);

  // Sync state helper
  const refreshData = () => {
    setEmployees(storage.getEmployees());
    setDocuments(storage.getDocuments());
    setLeaves(storage.getLeaves());
    setPayments(storage.getPayments());
    setAuditLogs(storage.getAuditLogs());
  };

  // Auth actions
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    refreshData();
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    refreshData();
  };

  const handleSwitchRole = (role: UserRole) => {
    const updated = auth.switchRole(role);
    setCurrentUser(updated);
    refreshData();
  };

  // Employee CRUD
  const handleAddEmployee = (newEmp: Employee) => {
    storage.saveEmployee(newEmp);
    storage.addAuditLog({
      userId: currentUser?.id || 'USR-SYS',
      userName: currentUser?.name || 'Authorized Staff',
      userRole: currentUser?.role || 'Super Admin',
      action: 'CREATE',
      targetType: 'Employee',
      targetId: newEmp.id,
      targetName: `${newEmp.firstName} ${newEmp.lastName}`,
      details: `Registered new ${newEmp.employment.category} (${newEmp.employment.jobTitle}) with ID ${newEmp.id}`,
    });
    refreshData();
    setSelectedEmployee(newEmp);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    storage.saveEmployee(updatedEmp);
    storage.addAuditLog({
      userId: currentUser?.id || 'USR-SYS',
      userName: currentUser?.name || 'Authorized Staff',
      userRole: currentUser?.role || 'Super Admin',
      action: 'UPDATE',
      targetType: 'Employee',
      targetId: updatedEmp.id,
      targetName: `${updatedEmp.firstName} ${updatedEmp.lastName}`,
      details: `Updated personal & employment profile for ${updatedEmp.id}`,
    });
    refreshData();
    setSelectedEmployee(updatedEmp);
  };

  // Document CRUD
  const handleAddDocument = (newDoc: EmployeeDocument) => {
    storage.saveDocument(newDoc);
    const emp = employees.find(e => e.id === newDoc.employeeId);
    storage.addAuditLog({
      userId: currentUser?.id || 'USR-SYS',
      userName: currentUser?.name || 'Authorized Staff',
      userRole: currentUser?.role || 'Super Admin',
      action: 'DOCUMENT_UPLOAD',
      targetType: 'Document',
      targetId: newDoc.id,
      targetName: emp ? `${emp.firstName} ${emp.lastName}` : newDoc.employeeId,
      details: `Uploaded ${newDoc.category} "${newDoc.title}" (Exp: ${newDoc.expiryDate})`,
    });
    refreshData();
  };

  const handleDeleteDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    storage.deleteDocument(docId);
    if (doc) {
      storage.addAuditLog({
        userId: currentUser?.id || 'USR-SYS',
        userName: currentUser?.name || 'Authorized Staff',
        userRole: currentUser?.role || 'Super Admin',
        action: 'DELETE',
        targetType: 'Document',
        targetId: docId,
        details: `Deleted document "${doc.title}"`,
      });
    }
    refreshData();
  };

  // Leave CRUD
  const handleAddLeave = (newLeave: LeaveRecord, deduct: boolean) => {
    storage.saveLeave(newLeave, deduct);
    const emp = employees.find(e => e.id === newLeave.employeeId);
    storage.addAuditLog({
      userId: currentUser?.id || 'USR-SYS',
      userName: currentUser?.name || 'Authorized Staff',
      userRole: currentUser?.role || 'Super Admin',
      action: 'LEAVE_REQUEST',
      targetType: 'Leave',
      targetId: newLeave.id,
      targetName: emp ? `${emp.firstName} ${emp.lastName}` : newLeave.employeeId,
      details: `Recorded ${newLeave.durationDays} day(s) ${newLeave.leaveType} Leave (${newLeave.startDate} to ${newLeave.endDate})`,
    });
    refreshData();
    // Update selected employee reference
    if (selectedEmployee && selectedEmployee.id === newLeave.employeeId) {
      const refreshedEmp = storage.getEmployeeById(newLeave.employeeId);
      if (refreshedEmp) setSelectedEmployee(refreshedEmp);
    }
  };

  const handleUpdateLeaveBalances = (empId: string, balances: Employee['leaveBalances']) => {
    storage.updateEmployeeLeaveBalances(empId, balances);
    const emp = employees.find(e => e.id === empId);
    storage.addAuditLog({
      userId: currentUser?.id || 'USR-SYS',
      userName: currentUser?.name || 'Authorized Staff',
      userRole: currentUser?.role || 'Super Admin',
      action: 'LEAVE_ADJUST',
      targetType: 'Leave',
      targetId: empId,
      targetName: emp ? `${emp.firstName} ${emp.lastName}` : empId,
      details: `Adjusted leave balance allocations: Annual (${balances.annual.remaining}d remaining), Sick (${balances.sick.remaining}d), Emergency (${balances.emergency.remaining}d)`,
    });
    refreshData();
    if (selectedEmployee && selectedEmployee.id === empId) {
      const refreshedEmp = storage.getEmployeeById(empId);
      if (refreshedEmp) setSelectedEmployee(refreshedEmp);
    }
  };

  // Payment CRUD
  const handleAddPayment = (newPayment: SalaryPayment) => {
    storage.savePayment(newPayment);
    const emp = employees.find(e => e.id === newPayment.employeeId);
    storage.addAuditLog({
      userId: currentUser?.id || 'USR-SYS',
      userName: currentUser?.name || 'Authorized Staff',
      userRole: currentUser?.role || 'Super Admin',
      action: 'PAYMENT',
      targetType: 'Payment',
      targetId: newPayment.id,
      targetName: emp ? `${emp.firstName} ${emp.lastName}` : newPayment.employeeId,
      details: `Disbursed ${newPayment.period} salary AED ${newPayment.netAmount.toLocaleString()} via ${newPayment.paymentMethod} (Ref: ${newPayment.transactionReference})`,
    });
    refreshData();
  };

  // Backup & Reset
  const handleExportBackup = () => {
    const json = storage.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Royal_Office_HR_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonString: string) => {
    const ok = storage.importBackup(jsonString);
    if (ok) {
      alert('System data successfully restored from backup file!');
      refreshData();
    } else {
      alert('Failed to parse backup JSON file. Please ensure it is a valid Royal Office HR export.');
    }
  };

  const handleResetData = () => {
    storage.resetToDefault();
    refreshData();
    setSelectedEmployee(null);
  };

  // Count expiring docs
  const expiringDocsCount = documents.filter(d => {
    const s = getDocumentExpiryStatus(d.expiryDate);
    return s.status === 'expired' || s.daysLeft <= 60;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && activeTab !== 'employees') {
            setActiveTab('employees');
            setSelectedEmployee(null);
          }
        }}
        onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedEmployee(null);
        }}
      />

      {/* Main Container with Sidebar & Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Sidebar Navigation (hidden on desktop for dashboard to create open u.ae portal layout) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedEmployee(null);
          }}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          userRole={currentUser?.role}
          expiringDocsCount={expiringDocsCount}
          hideDesktop={activeTab === 'dashboard'}
        />

        {/* Tab Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* If an employee dossier is currently open */}
          {selectedEmployee ? (
            <EmployeeDetailView
              employee={selectedEmployee}
              documents={documents}
              leaves={leaves}
              payments={payments}
              auditLogs={auditLogs}
              onBack={() => setSelectedEmployee(null)}
              onUpdateEmployee={handleUpdateEmployee}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onAddLeave={handleAddLeave}
              onUpdateLeaveBalances={handleUpdateLeaveBalances}
              onAddPayment={handleAddPayment}
              currentUserRole={currentUser?.role}
            />
          ) : activeTab === 'dashboard' ? (
            <DashboardTab
              employees={employees}
              documents={documents}
              payments={payments}
              auditLogs={auditLogs}
              onNavigateToEmployees={() => setActiveTab('employees')}
              onNavigateToCompliance={() => setActiveTab('compliance')}
              onNavigateToPayroll={() => setActiveTab('payroll')}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
              onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
            />
          ) : activeTab === 'employees' ? (
            <EmployeeList
              employees={employees}
              documents={documents}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
              onOpenAddModal={() => setIsAddEmployeeOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          ) : activeTab === 'compliance' ? (
            <ComplianceTab
              employees={employees}
              documents={documents}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
            />
          ) : activeTab === 'payroll' ? (
            <PayrollCenterTab
              employees={employees}
              payments={payments}
              onAddPayment={handleAddPayment}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
            />
          ) : activeTab === 'audit' ? (
            <GlobalAuditTab
              auditLogs={auditLogs}
            />
          ) : null}
        </main>
      </div>

      {/* Official UAE Government Style Footer */}
      <Footer
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedEmployee(null);
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onAddEmployee={handleAddEmployee}
        existingCount={employees.length}
      />

    </div>
  );
};
export default App;
