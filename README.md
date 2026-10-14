# HR System for Office of His Highness Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
*مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان — نظام الموارد البشرية*

A simplified, regal web platform tailored for the human resources administration of the **Office of His Highness Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan**. Designed with a warm ivory letterhead aesthetic (`#FAF7F2`), UAE Golden Falcon emblem, metallic gold accents (`#BA9547`), and warm sand borders (`#E7DEC8`).

Features digital personnel files, UAE document compliance and expiry radar, multi-tier leave balances, salary structures, cash voucher vs. bank WPS disbursement tracking, official letterhead PDF payslips, and an immutable audit trail.

---

## Key Modules

- **Personnel Directory**: Searchable records, quick filtering (trades, staff vs. labour, active status, document compliance), and dual Card Grid / DataGrid views.
- **Individual Digital Dossier**:
  - **Profile Details**: Contact, trade specialty, assignment location, official sponsorship, emergency contacts.
  - **Documents Vault**: Categorized credentials (Passport, Visa, Emirates ID, Labor Card, Medical Insurance, Safety Certifications) with live expiry badges (Valid, Expiring Soon, Expired).
  - **Leave Balances**: 3-tier tracking for Annual, Sick, and Emergency leave balances with automatic deduction on approval and HR adjustment.
  - **Salary & Compensation Records**: Wage breakdown and built-in **Official Letterhead PDF Payslip Generator** featuring UAE Falcon Coat of Arms and bilingual office headers.
  - **Payment Tracking**: Full disbursement ledger capturing exact dates (Day, Month, Year), transaction/voucher references, and Cash Voucher vs. Bank WPS methods.
  - **Modification Audit**: Dedicated activity timeline for every personnel record.
- **Office Document Compliance Radar**: 30/60/90-day expiry notifications with 1-click CSV report export.
- **Payroll Center**: Monthly disbursement analytics and cash-to-bank distribution breakdown.
- **Role-Based Access Control (RBAC)**: Secure access portal with Super Admin, HR Manager, Payroll Officer, and Auditor roles.

---

## Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@officehh.ae` | `admin123` | Full access to all modules, records, and deletions |
| **HR Manager** | `hr@officehh.ae` | `hr123` | Personnel records, document uploads, and leave approvals |
| **Payroll Officer** | `payroll@officehh.ae` | `payroll123` | Salary structures, payments, and PDF payslip generation |
| **Auditor** | `auditor@officehh.ae` | `auditor123` | Read-only access to files and full audit logs |

*(Legacy `@vanguardhr.com` credentials remain supported for backward compatibility)*

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
