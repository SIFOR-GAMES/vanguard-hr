import { User, UserRole } from '../types/hr';
import { INITIAL_USERS } from '../data/seedData';
import { storage } from './storage';

const AUTH_KEY = 'vanguard_hr_session_user';

export const CREDENTIALS: Record<string, { password: string; user: User }> = {
  'admin@officehh.ae': {
    password: 'admin123',
    user: INITIAL_USERS[0],
  },
  'hr@officehh.ae': {
    password: 'hr123',
    user: INITIAL_USERS[1],
  },
  'payroll@officehh.ae': {
    password: 'payroll123',
    user: INITIAL_USERS[2],
  },
  'auditor@officehh.ae': {
    password: 'auditor123',
    user: INITIAL_USERS[3],
  },
  // Backward compatibility
  'admin@vanguardhr.com': {
    password: 'admin123',
    user: INITIAL_USERS[0],
  },
  'hr@vanguardhr.com': {
    password: 'hr123',
    user: INITIAL_USERS[1],
  },
  'payroll@vanguardhr.com': {
    password: 'payroll123',
    user: INITIAL_USERS[2],
  },
  'auditor@vanguardhr.com': {
    password: 'auditor123',
    user: INITIAL_USERS[3],
  },
};

export type Permission = 
  | 'manage_employees'
  | 'manage_documents'
  | 'manage_leaves'
  | 'manage_payroll'
  | 'view_salaries'
  | 'delete_records'
  | 'view_audit_logs'
  | 'export_data';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'Super Admin': [
    'manage_employees',
    'manage_documents',
    'manage_leaves',
    'manage_payroll',
    'view_salaries',
    'delete_records',
    'view_audit_logs',
    'export_data',
  ],
  'HR Manager': [
    'manage_employees',
    'manage_documents',
    'manage_leaves',
    'view_salaries',
    'view_audit_logs',
    'export_data',
  ],
  'Payroll Officer': [
    'manage_payroll',
    'view_salaries',
    'export_data',
  ],
  'Auditor': [
    'view_audit_logs',
    'export_data',
  ],
};

class AuthService {
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : INITIAL_USERS[0]; // Default to Super Admin for smooth initial loading
    } catch {
      return INITIAL_USERS[0];
    }
  }

  login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const cred = CREDENTIALS[email.toLowerCase().trim()];
    if (!cred) {
      return { success: false, error: 'Invalid email address' };
    }
    if (cred.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    localStorage.setItem(AUTH_KEY, JSON.stringify(cred.user));
    storage.addAuditLog({
      userId: cred.user.id,
      userName: cred.user.name,
      userRole: cred.user.role,
      action: 'LOGIN',
      targetType: 'Auth',
      details: `${cred.user.name} signed in as ${cred.user.role}`,
    });

    return { success: true, user: cred.user };
  }

  switchRole(role: UserRole): User {
    const user = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    storage.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      targetType: 'Auth',
      details: `Switched session to ${user.name} (${user.role})`,
    });
    return user;
  }

  logout(): void {
    const current = this.getCurrentUser();
    if (current) {
      storage.addAuditLog({
        userId: current.id,
        userName: current.name,
        userRole: current.role,
        action: 'LOGIN',
        targetType: 'Auth',
        details: `${current.name} signed out`,
      });
    }
    localStorage.removeItem(AUTH_KEY);
  }

  hasPermission(permission: Permission, role?: UserRole): boolean {
    const targetRole = role || this.getCurrentUser()?.role;
    if (!targetRole) return false;
    return ROLE_PERMISSIONS[targetRole]?.includes(permission) || false;
  }
}

export const auth = new AuthService();
