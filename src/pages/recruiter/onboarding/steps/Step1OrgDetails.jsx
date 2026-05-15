import { Building2, ChevronDown } from 'lucide-react';

const SIZES = ['1 – 10', '11 – 50', '51 – 200', '201 – 500', '500+'];

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'E-Commerce & Retail',
  'Education', 'Media & Entertainment', 'Manufacturing', 'Consulting',
  'Government & Public Sector', 'Other',
];

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full h-10 px-3.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#22D3EE] focus:bg-white transition-colors"
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full h-10 px-3.5 pr-9 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[8px] text-[14px] outline-none focus:border-[#22D3EE] focus:bg-white transition-colors appearance-none cursor-pointer ${
          value ? 'text-[#0F172A]' : 'text-[#94A3B8]'
        }`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
    </div>
  );
}

function FieldAccent({ label }) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0F172A]">
      <span className="w-0.5 h-3.5 rounded-full bg-[#22D3EE] inline-block" />
      {label}
    </span>
  );
}

export default function Step1OrgDetails({ data, onChange }) {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[14px] shadow-[0_1px_3px_0_rgba(15,40,84,0.04),0_1px_2px_-1px_rgba(15,40,84,0.06)] overflow-hidden">

        {/* Card header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-xl bg-[#CFFAFE] flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5 text-[#0E7490]" />
          </div>
          <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
            Tell us about your company
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1.5 leading-relaxed">
            This helps us personalize your workspace setup.
          </p>
        </div>

        {/* Card body */}
        <div className="px-8 py-6 space-y-5">

          {/* Company name */}
          <Field label={<FieldAccent label="Company name" />}>
            <Input
              placeholder="Acme Corp"
              value={data.company_name}
              onChange={set('company_name')}
            />
          </Field>

          {/* Size + Industry */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={<FieldAccent label="Company size" />}>
              <Select
                value={data.company_size}
                onChange={set('company_size')}
                options={SIZES}
                placeholder="Select size"
              />
            </Field>
            <Field label={<FieldAccent label="Industry" />}>
              <Select
                value={data.industry}
                onChange={set('industry')}
                options={INDUSTRIES}
                placeholder="Select industry"
              />
            </Field>
          </div>

          {/* Website */}
          <Field label="Website (optional)">
            <Input
              placeholder="https://acme.com"
              value={data.website}
              onChange={set('website')}
              type="url"
            />
          </Field>

        </div>
      </div>
    </div>
  );
}
