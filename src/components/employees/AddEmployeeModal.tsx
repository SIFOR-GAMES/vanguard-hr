import React, { useState } from 'react';
import { UserPlus, HardHat, Building, CreditCard, Banknote } from 'lucide-react';
import { Modal } from '../common/Modal';
import { 
  Employee, 
  EmploymentCategory, 
  ContractType, 
  PaymentMethod 
} from '../../types/hr';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: Employee) => void;
  existingCount: number;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
  existingCount,
}) => {
  const [category, setCategory] = useState<EmploymentCategory>('Labourer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1995-01-01');
  const [nationality, setNationality] = useState('India');
  const [phone, setPhone] = useState('+971 50 ');
  const [email, setEmail] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [address, setAddress] = useState('Al Quoz Camp 4, Dubai');

  const [jobTitle, setJobTitle] = useState('Skilled Electrician');
  const [trade, setTrade] = useState('Electrical');
  const [department, setDepartment] = useState('Site Operations');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractType, setContractType] = useState<ContractType>('Limited (2 Years)');
  const [workLocation, setWorkLocation] = useState('Downtown Tower Site A');
  const [laborCardNumber, setLaborCardNumber] = useState(`LC-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [nationalIdNumber, setNationalIdNumber] = useState(`784-1995-${Math.floor(1000000 + Math.random() * 9000000)}-1`);
  const [passportNumber, setPassportNumber] = useState('P' + Math.floor(10000000 + Math.random() * 90000000));

  const [basicSalary, setBasicSalary] = useState(3000);
  const [housingAllowance, setHousingAllowance] = useState(800);
  const [transportAllowance, setTransportAllowance] = useState(400);
  const [foodAllowance, setFoodAllowance] = useState(300);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [bankName, setBankName] = useState('Emirates NBD');
  const [iban, setIban] = useState('AE07026000019988776601');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prefix = category === 'Labourer' ? 'LAB' : 'EMP';
    const newId = `${prefix}-${1000 + existingCount + 1}`;

    const newEmployee: Employee = {
      id: newId,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      nationality,
      photoUrl: gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      contact: {
        phone,
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@workers.officehh.ae`,
        emergencyContactName: emergencyName || 'Family Member',
        emergencyContactRelation: 'Spouse/Parent',
        emergencyContactPhone: emergencyPhone || phone,
        residentialAddress: address,
      },
      employment: {
        category,
        jobTitle,
        trade,
        department,
        joiningDate,
        contractType,
        status: 'Active',
        sponsor: 'Office of H.H. Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan',
        workLocation,
        laborCardNumber,
        nationalIdNumber,
        passportNumber,
      },
      leaveBalances: {
        annual: { total: 30, taken: 0, remaining: 30 },
        sick: { total: 15, taken: 0, remaining: 15 },
        emergency: { total: 5, taken: 0, remaining: 5 },
      },
      salaryStructure: {
        basicSalary: Number(basicSalary),
        housingAllowance: Number(housingAllowance),
        transportAllowance: Number(transportAllowance),
        foodAllowance: Number(foodAllowance),
        otherAllowance: 100,
        overtimeHourlyRate: Math.round(Number(basicSalary) / 160 * 1.25),
        currency: 'AED',
        preferredPaymentMethod: paymentMethod,
        bankDetails: paymentMethod === 'Bank Transfer' ? {
          bankName,
          accountNumber: iban.slice(-10),
          iban,
        } : undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddEmployee(newEmployee);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Employee / Labourer Digital Dossier"
      subtitle="Register a new workforce member with employment, document & salary records"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Category selector */}
        <div className="flex gap-3">
          {(['Labourer', 'Staff', 'Technical'] as EmploymentCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                if (cat === 'Labourer') {
                  setPaymentMethod('Cash');
                  setJobTitle('Skilled Mason');
                  setTrade('Masonry');
                } else {
                  setPaymentMethod('Bank Transfer');
                  setJobTitle(cat === 'Staff' ? 'Site Coordinator' : 'HSE Engineer');
                  setTrade(cat === 'Staff' ? 'Administration' : 'Engineering');
                }
              }}
              className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                category === cat
                  ? 'border-[#BA9547] bg-[#FBF8F0] dark:bg-[#2A2318] text-[#846429] dark:text-[#E2C687] ring-2 ring-[#BA9547]/20'
                  : 'border-[#E7DEC8] dark:border-[#383129] hover:bg-[#FAF7F2] dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {cat === 'Labourer' ? <HardHat className="w-4 h-4" /> : <Building className="w-4 h-4" />}
              <span>{cat} Record</span>
            </button>
          ))}
        </div>

        {/* Section 1: Personal Details */}
        <div className="space-y-3">
          <span className="font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-1">
            1. Personal & Contact Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Tariq"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Mahmoud"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nationality *</label>
              <input
                type="text"
                required
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. India, Pakistan, Egypt, Nepal"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 123 4567"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Camp / Residence</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Sonapur Camp 4, Room 10"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Employment & Compliance */}
        <div className="space-y-3">
          <span className="font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-1">
            2. Trade, Site & Identification
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Electrician"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Trade Specialization *</label>
              <input
                type="text"
                required
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                placeholder="Electrical, Masonry, Plumbing"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Location Site</label>
              <input
                type="text"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder="Downtown Tower Site A"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Labor Card Number</label>
              <input
                type="text"
                value={laborCardNumber}
                onChange={(e) => setLaborCardNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">National ID (Emirates ID)</label>
              <input
                type="text"
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Passport Number</label>
              <input
                type="text"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Salary & Payment Route */}
        <div className="space-y-3">
          <span className="font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-1">
            3. Compensation & Payment Method
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Basic Salary (AED) *</label>
              <input
                type="number"
                required
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Housing Allowance (AED)</label>
              <input
                type="number"
                value={housingAllowance}
                onChange={(e) => setHousingAllowance(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transport (AED)</label>
              <input
                type="number"
                value={transportAllowance}
                onChange={(e) => setTransportAllowance(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Route</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              >
                <option value="Cash">💵 Cash Payment</option>
                <option value="Bank Transfer">🏦 Bank Transfer (WPS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[#E7DEC8] dark:border-[#2E2822]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-stone-600 dark:text-stone-300 hover:bg-[#FAF7F2] dark:hover:bg-stone-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#BA9547] hover:bg-[#A17D34] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register & Create Dossier File</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
