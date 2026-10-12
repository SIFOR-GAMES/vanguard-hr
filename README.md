# Vanguard HR — Enterprise Employee & Labourer Management System

A centralized, responsive web platform designed for human resources departments managing diverse staff and labour workforces. Features individual digital files, automated document expiry and compliance tracking, multi-tier leave balance management, salary records, payment tracking (Cash vs. Bank Transfer), official PDF payslip generation, and an immutable audit trail.

---

## Key Modules

- **Employee & Labourer Directory**: Searchable records, multi-filtering (trade, category, duty status, compliance status), and dual Card Grid / DataGrid Table views.
- **Individual Digital Dossier**:
  - **Profile Details**: Contact, trade specialty, site location, sponsor, emergency contacts.
  - **Documents Vault**: Categorized documents (Passport, Visa, Emirates ID, Labor Card, Medical Insurance, Safety Certifications) with live expiry badges (Valid, Expiring Soon, Expired).
  - **Leave Balances**: 3-tier tracking for Annual, Sick, and Emergency leave balances with automatic deduction on approval and HR adjustment.
  - **Salary & Compensation Records**: Wage breakdown and built-in **Official PDF Payslip Generator** compliant with UAE/GCC labor standards.
  - **Payment Tracking**: Full payment ledger capturing exact dates (Day, Month, Year), transaction/voucher references, and Cash vs. Bank transfer methods.
  - **Modification Audit**: Dedicated activity timeline for every employee record.
- **Company-Wide Compliance Manager**: Radar for upcoming document expirations with 1-click CSV export.
- **Payroll Center**: Monthly disbursement analytics and cash-to-bank distribution breakdown.
- **Role-Based Access Control (RBAC)**: Password-protected sign-in portal with Super Admin, HR Manager, Payroll Officer, and Auditor roles.

---

## Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@vanguardhr.com` | `admin123` | Full access to all modules, records, and deletions |
| **HR Manager** | `hr@vanguardhr.com` | `hr123` | Employee records, document uploads, and leave approvals |
| **Payroll Officer** | `payroll@vanguardhr.com` | `payroll123` | Salary structures, payments, and PDF payslip generation |
| **Auditor** | `auditor@vanguardhr.com` | `auditor123` | Read-only access to files and full audit logs |

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Document & PDF Generation**: jsPDF
- **Persistence**: LocalStorage with auto-recovery and JSON backup/restore
- **Deployment**: 9pm.ai Platform (`--spa`)

---

## Getting Started

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
