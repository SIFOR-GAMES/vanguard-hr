import { jsPDF } from 'jspdf';
import { Employee, SalaryPayment } from '../types/hr';

export function generatePayslipPdf(employee: Employee, payment: SalaryPayment): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Company Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('VANGUARD CONTRACTING LLC', 15, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Human Resources & Workforce Management Department', 15, 22);
  doc.text('Downtown Tower Project • PO Box 88219, Dubai, United Arab Emirates', 15, 27);

  // Payslip Badge on Right
  doc.setFillColor(79, 70, 229); // brand-600
  doc.roundedRect(pageWidth - 65, 8, 50, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL PAYSLIP', pageWidth - 60, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.period.toUpperCase(), pageWidth - 60, 21);

  // Metadata Bar
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(0, 35, pageWidth, 12, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.text(`Voucher / Ref: ${payment.transactionReference}`, 15, 43);
  doc.text(`Payment Date: ${payment.paymentDate}`, 85, 43);
  doc.setFont('helvetica', 'bold');
  doc.text(`Method: ${payment.paymentMethod.toUpperCase()}`, 155, 43);

  // Employee Information Box
  let y = 56;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(15, y, pageWidth - 30, 36, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EMPLOYEE / LABOURER DETAILS', 20, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.text('Full Name:', 20, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${employee.firstName} ${employee.lastName}`, 50, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Employee ID:', 20, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.id, 50, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Trade / Title:', 20, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${employee.employment.jobTitle} (${employee.employment.trade})`, 50, y + 30);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Department:', 110, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.employment.department, 140, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Labor Card #:', 110, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.employment.laborCardNumber, 140, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Work Location:', 110, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.employment.workLocation, 140, y + 30);

  // Earnings & Deductions Tables
  y = 100;

  // Earnings Table Header
  doc.setFillColor(238, 242, 255); // brand-50
  doc.rect(15, y, 90, 8, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.line(15, y + 8, 105, y + 8);
  doc.setTextColor(67, 56, 202); // brand-700
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EARNINGS & ALLOWANCES', 18, y + 5.5);
  doc.text('AMOUNT (AED)', 80, y + 5.5);

  // Deductions Table Header
  doc.setFillColor(254, 242, 242); // rose-50
  doc.rect(110, y, 85, 8, 'F');
  doc.setDrawColor(254, 205, 211);
  doc.line(110, y + 8, 195, y + 8);
  doc.setTextColor(190, 18, 60); // rose-700
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
    doc.setTextColor(71, 85, 105);
    doc.text(row.label, 18, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 102, y, { align: 'right' });
    y += 7;
  });

  // Deductions Rows
  let dy = 112;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(payment.deductionReason || 'General Deductions / Advances', 113, dy);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 }), 192, dy, { align: 'right' });

  // Totals Row
  y = 160;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Gross Earnings:', 18, y);
  doc.text(`AED ${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 102, y, { align: 'right' });

  doc.text('Total Deductions:', 113, y);
  doc.text(`AED ${payment.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 192, y, { align: 'right' });

  // Net Pay Highlight Box
  y += 10;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(15, y, pageWidth - 30, 20, 2, 2, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.setFont('helvetica', 'bold');
  doc.text('NET SALARY PAYABLE:', 22, y + 12);

  doc.setFontSize(16);
  doc.setTextColor(21, 128, 61); // emerald-700
  doc.text(`AED ${payment.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 25, y + 13, { align: 'right' });

  // Payment method note
  y += 28;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  if (payment.paymentMethod === 'Cash') {
    doc.text('Payment Method: CASH DISBURSEMENT. Confirmed by cash voucher acknowledgment.', 15, y);
  } else {
    doc.text(`Payment Method: BANK TRANSFER (WPS). Disbursed to ${employee.salaryStructure.bankDetails?.bankName || 'Bank Account'} (IBAN: ${employee.salaryStructure.bankDetails?.iban || 'N/A'}).`, 15, y);
  }

  // Signatures Area
  y += 18;
  doc.setDrawColor(203, 213, 225);
  
  // Signature 1
  doc.line(18, y + 18, 65, y + 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Prepared By:', 18, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(payment.paidBy || 'Payroll Officer', 18, y + 27);

  // Signature 2
  doc.line(78, y + 18, 125, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('Approved By:', 78, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text('Sarah Jenkins (HR Director)', 78, y + 27);

  // Signature 3
  doc.line(138, y + 18, 192, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.paymentMethod === 'Cash' ? 'Employee Thumbprint / Sign:' : 'Employee Acknowledgment:', 138, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(`${employee.firstName} ${employee.lastName}`, 138, y + 27);

  // Footer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated official payroll slip issued by Vanguard Contracting LLC HR Management System.', pageWidth / 2, 285, { align: 'center' });

  // Trigger Save
  doc.save(`Payslip_${employee.id}_${payment.period.replace(/\s+/g, '_')}.pdf`);
}
