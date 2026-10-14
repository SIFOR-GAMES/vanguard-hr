import { jsPDF } from 'jspdf';
import { Employee, SalaryPayment } from '../types/hr';

export function generatePayslipPdf(employee: Employee, payment: SalaryPayment): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Warm Stationery Ivory Header Banner
  doc.setFillColor(250, 247, 242); // Warm Ivory #FAF7F2
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold Trim Line Under Header
  doc.setFillColor(186, 149, 71); // Royal Gold #BA9547
  doc.rect(0, 41.2, pageWidth, 1, 'F');

  // Office Title (English)
  doc.setTextColor(28, 25, 23); // Deep Charcoal #1C1917
  doc.setFontSize(13);
  doc.setFont('times', 'bold');
  doc.text('OFFICE OF HIS HIGHNESS SH. ZAYED BIN HAZZA BIN ZAYED AL NAHYAN', 15, 16);

  // Subtitle
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(132, 100, 41); // Deep Gold #846429
  doc.text('HUMAN RESOURCES & LABOUR MANAGEMENT DEPARTMENT', 15, 23);
  doc.setTextColor(120, 113, 108); // Muted Stone
  doc.text('Abu Dhabi & Dubai • United Arab Emirates', 15, 28);

  // Payslip Badge on Right
  doc.setFillColor(186, 149, 71); // Royal Gold
  doc.roundedRect(pageWidth - 65, 10, 50, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL PAYSLIP', pageWidth - 60, 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.period.toUpperCase(), pageWidth - 60, 24);

  // Metadata Bar
  doc.setFillColor(245, 241, 232); // Ivory Tint #F5F1E8
  doc.rect(0, 42.2, pageWidth, 12, 'F');
  doc.setTextColor(68, 64, 60);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Voucher / Ref: ${payment.transactionReference}`, 15, 50);
  doc.text(`Payment Date: ${payment.paymentDate}`, 85, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(`Disbursement: ${payment.paymentMethod.toUpperCase()}`, 150, 50);

  // Employee Information Box
  let y = 60;
  doc.setDrawColor(231, 222, 200); // Warm Sand Border #E7DEC8
  doc.setFillColor(253, 252, 249); // White Ivory
  doc.roundedRect(15, y, pageWidth - 30, 36, 2, 2, 'FD');

  doc.setFontSize(9.5);
  doc.setFont('times', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text('PERSONNEL & EMPLOYMENT DOSSIER RECORD', 20, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 108);

  // Column 1
  doc.text('Full Name:', 20, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(`${employee.firstName} ${employee.lastName}`, 50, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 108);
  doc.text('Personnel ID:', 20, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(employee.id, 50, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 108);
  doc.text('Trade / Title:', 20, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(`${employee.employment.jobTitle} (${employee.employment.trade})`, 50, y + 30);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 108);
  doc.text('Department:', 110, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(employee.employment.department, 140, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 108);
  doc.text('Labor Card #:', 110, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(employee.employment.laborCardNumber, 140, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 108);
  doc.text('Duty Location:', 110, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(employee.employment.workLocation, 140, y + 30);

  // Earnings & Deductions Tables
  y = 104;

  // Earnings Table Header
  doc.setFillColor(251, 248, 240); // Gold-50
  doc.rect(15, y, 90, 8, 'F');
  doc.setDrawColor(231, 222, 200);
  doc.line(15, y + 8, 105, y + 8);
  doc.setTextColor(132, 100, 41); // Deep Gold #846429
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EARNINGS & ALLOWANCES', 18, y + 5.5);
  doc.text('AMOUNT (AED)', 80, y + 5.5);

  // Deductions Table Header
  doc.setFillColor(254, 242, 242); // Rose-50
  doc.rect(110, y, 85, 8, 'F');
  doc.setDrawColor(254, 205, 211);
  doc.line(110, y + 8, 195, y + 8);
  doc.setTextColor(190, 18, 60); // Rose-700
  doc.text('DEDUCTIONS & ADJUSTMENTS', 113, y + 5.5);
  doc.text('AMOUNT (AED)', 170, y + 5.5);

  // Row Data
  y += 12;
  const earningsRows = [
    { label: 'Basic Salary', amount: payment.basicSalary },
    { label: 'Housing Allowance', amount: employee.salaryStructure.housingAllowance },
    { label: 'Transport Allowance', amount: employee.salaryStructure.transportAllowance },
    { label: 'Food Allowance', amount: employee.salaryStructure.foodAllowance },
    { label: 'Other Special Allowances', amount: employee.salaryStructure.otherAllowance },
    { label: `Overtime (${payment.overtimeHours} hrs)`, amount: payment.overtimePay },
  ];

  const totalEarnings = payment.basicSalary + payment.allowances + payment.overtimePay;

  earningsRows.forEach((row) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 113, 108);
    doc.text(row.label, 18, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(28, 25, 23);
    doc.text(row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 102, y, { align: 'right' });
    y += 7;
  });

  // Deductions Rows
  let dy = 116;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 108);
  doc.text(payment.deductionReason || 'General Deductions / Advances', 113, dy);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(payment.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 }), 192, dy, { align: 'right' });

  // Totals Row
  y = 162;
  doc.setDrawColor(231, 222, 200);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text('Total Gross Earnings:', 18, y);
  doc.text(`AED ${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 102, y, { align: 'right' });

  doc.text('Total Deductions:', 113, y);
  doc.text(`AED ${payment.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 192, y, { align: 'right' });

  // Net Pay Highlight Box
  y += 10;
  doc.setFillColor(251, 248, 240); // Gold-50
  doc.setDrawColor(212, 173, 91); // Gold-400
  doc.roundedRect(15, y, pageWidth - 30, 20, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(132, 100, 41); // Deep Gold #846429
  doc.setFont('helvetica', 'bold');
  doc.text('NET SALARY PAYABLE:', 22, y + 12);

  doc.setFontSize(15);
  doc.setTextColor(161, 125, 52); // Gold-600
  doc.text(`AED ${payment.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 25, y + 13, { align: 'right' });

  // Payment method note
  y += 28;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 113, 108);
  if (payment.paymentMethod === 'Cash') {
    doc.text('Disbursement Method: CASH PAYMENT. Acknowledged by signature / thumbprint below.', 15, y);
  } else {
    doc.text(`Disbursement Method: BANK TRANSFER (WPS). Disbursed to ${employee.salaryStructure.bankDetails?.bankName || 'Bank Account'} (IBAN: ${employee.salaryStructure.bankDetails?.iban || 'N/A'}).`, 15, y);
  }

  // Signatures Area
  y += 18;
  doc.setDrawColor(231, 222, 200);
  
  // Signature 1
  doc.line(18, y + 18, 65, y + 18);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 108);
  doc.text('Prepared By:', 18, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(payment.paidBy || 'Payroll Officer', 18, y + 26);

  // Signature 2
  doc.line(78, y + 18, 125, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized By:', 78, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text('Office HR Director', 78, y + 26);

  // Signature 3
  doc.line(138, y + 18, 192, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.paymentMethod === 'Cash' ? 'Personnel Signature / Thumbprint:' : 'Personnel Acknowledgment:', 138, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${employee.firstName} ${employee.lastName}`, 138, y + 26);

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(168, 162, 158);
  doc.text('Official Document • Office of H.H. Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan • HR Management System', pageWidth / 2, 285, { align: 'center' });

  // Trigger Save
  doc.save(`Payslip_${employee.id}_${payment.period.replace(/\s+/g, '_')}.pdf`);
}

