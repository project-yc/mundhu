import { Building2 } from 'lucide-react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

const SIZES = ['1 – 10', '11 – 50', '51 – 200', '201 – 500', '500+'];

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'E-Commerce & Retail',
  'Education', 'Media & Entertainment', 'Manufacturing', 'Consulting',
  'Government & Public Sector', 'Other',
];

export default function Step1OrgDetails({ data, onChange }) {
  const set  = (key) => (val) => onChange({ ...data, [key]: val });
  const setE = (key) => (e)   => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="w-full">
      <div className="w-12 h-12 rounded-xl bg-[#FFEDE0] flex items-center justify-center mb-6">
        <Building2 className="w-[22px] h-[22px] text-[#FB7414]" />
      </div>

      <h1 className="text-[28px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
        Let's set up your organization
      </h1>
      <p className="text-[15px] text-[#475569] mt-2.5 mb-9 leading-relaxed">
        We'll tailor your workspace and hiring workflows around your team from here.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company_name" className="text-[13px] font-semibold text-[#334155]">
            Organization name
          </Label>
          <Input
            id="company_name"
            placeholder="Acme Corp"
            value={data.company_name}
            onChange={setE('company_name')}
            className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-[#FB7414]/25 focus-visible:border-[#FB7414]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-[#334155]">Industry</Label>
          <Select value={data.industry} onValueChange={set('industry')}>
            <SelectTrigger className="h-11 rounded-[10px] border-[#E2E8F0]">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-[#334155]">Number of people</Label>
          <Select value={data.company_size} onValueChange={set('company_size')}>
            <SelectTrigger className="h-11 rounded-[10px] border-[#E2E8F0]">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-[#334155]">
            Website <span className="text-[#94A3B8] font-normal">(optional)</span>
          </Label>
          <Input
            type="url"
            placeholder="https://acme.com"
            value={data.website}
            onChange={setE('website')}
            className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-[#FB7414]/25 focus-visible:border-[#FB7414]"
          />
        </div>
      </div>
    </div>
  );
}