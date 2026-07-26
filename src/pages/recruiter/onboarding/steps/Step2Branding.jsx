import { useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Palette, X, FileImage, Pipette, Lock } from 'lucide-react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Separator } from '../../../../components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';

const PRESET_COLORS = ['#FB7414', '#F59E0B', '#EF4444', '#8B5CF6', '#1D4ED8', '#0F172A'];

function LogoUpload({ file, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const handleFile = (f) => { if (f && f.type.startsWith('image/')) onChange(f); };

  return (
    <div className="space-y-2">
      <Label className="text-[13px] font-semibold text-[#334155]">Workspace logo</Label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={`relative flex flex-col items-center justify-center w-full h-[104px] rounded-[10px] border-2 border-dashed cursor-pointer transition-colors ${
          dragOver ? 'border-[#FB7414] bg-[#FFF3EA]' : 'border-[#E2E8F0] bg-white hover:border-[#FB7414] hover:bg-[#FFF3EA]'
        }`}
      >
        {file ? (
          <>
            <img src={URL.createObjectURL(file)} alt="logo preview" className="h-14 w-auto max-w-[110px] object-contain rounded-[6px]" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E2E8F0] flex items-center justify-center hover:bg-[#CBD5E1]"
            >
              <X className="w-3 h-3 text-[#64748B]" />
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg border-2 border-dashed border-[#CBD5E1] flex items-center justify-center mb-1.5">
              <FileImage className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <p className="text-[12px] text-[#64748B] font-medium">
              <span className="text-[#FB7414]">Click to upload</span> or drag & drop
            </p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>
    </div>
  );
}

function ColorSwatch({ color, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(color)}
      className={`w-7 h-7 rounded-full transition-all flex-shrink-0 ${selected ? 'ring-2 ring-offset-2 ring-[#FB7414] scale-110' : 'hover:scale-105'}`}
      style={{ backgroundColor: color }}
    />
  );
}

function ColorPicker({ color, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-[13px] font-semibold text-[#334155]">Brand color</Label>
      <div className="flex items-center gap-2.5 h-11">
        {PRESET_COLORS.map(c => (
          <ColorSwatch key={c} color={c} selected={color.toLowerCase() === c.toLowerCase()} onClick={onChange} />
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-7 h-7 rounded-full border-2 border-dashed border-[#CBD5E1] text-[#94A3B8] hover:border-[#FB7414] hover:text-[#FB7414] flex items-center justify-center transition-colors"
            >
              <Pipette className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker color={color} onChange={onChange} style={{ width: 200, height: 150 }} />
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] px-3 h-9 mt-3">
              <div className="w-3.5 h-3.5 rounded-full border border-[#E2E8F0] flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-[#94A3B8] font-mono">#</span>
              <input
                className="flex-1 bg-transparent text-[12px] text-[#0F172A] font-mono outline-none"
                value={color.replace('#', '')}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                  if (v.length === 6) onChange(`#${v}`);
                }}
                maxLength={6}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function BrowserMockup({ name, tagline, brandColor, logo }) {
  const displayName = name || 'Acme Corp Tech Roles';
  return (
    <div className="rounded-[14px] border border-[#E2E8F0] bg-white overflow-hidden">
      <div className="h-10 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center px-4 gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FDE68A]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#BBF7D0]" />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-md h-6 px-2.5 max-w-[220px]">
          <Lock className="w-2.5 h-2.5 text-[#94A3B8] flex-shrink-0" />
          <span className="text-[11px] text-[#94A3B8] truncate">yourcompany.trudev.io</span>
        </div>
      </div>
      <div className="p-10 flex flex-col items-center text-center bg-[#FAFAFA]">
        {logo ? (
          <img src={URL.createObjectURL(logo)} alt="" className="w-12 h-12 rounded-lg object-contain mb-4 bg-white border border-[#E2E8F0] p-1.5" />
        ) : (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-[16px] mb-4"
            style={{ backgroundColor: brandColor }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <p className="text-[16px] font-semibold text-[#0F172A]">{displayName}</p>
        {tagline && <p className="text-[13px] text-[#64748B] mt-1">{tagline}</p>}
        <button
          type="button"
          className="mt-5 text-[13px] font-semibold px-5 py-2.5 rounded-[8px] text-white"
          style={{ backgroundColor: brandColor }}
        >
          Start Assessment
        </button>
      </div>
    </div>
  );
}

export default function Step2Branding({ data, onChange }) {
  const set  = (key) => (val) => onChange({ ...data, [key]: val });
  const setE = (key) => (e)   => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="w-full">
      <div className="w-12 h-12 rounded-xl bg-[#FFEDE0] flex items-center justify-center mb-6">
        <Palette className="w-[22px] h-[22px] text-[#FB7414]" />
      </div>

      <h1 className="text-[28px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
        Make it feel like yours
      </h1>
      <p className="text-[15px] text-[#475569] mt-2.5 mb-9 leading-relaxed">
        Candidates will see this branding throughout their assessment experience.
      </p>

      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-4">Identity</p>
      <div className="grid sm:grid-cols-2 gap-6">
        <LogoUpload file={data.logo} onChange={set('logo')} />
        <ColorPicker color={data.brand_color} onChange={set('brand_color')} />
      </div>

      <Separator className="my-8" />

      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-4">Candidate Details</p>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-[#334155]">Candidate-facing name</Label>
          <Input
            placeholder="e.g. Acme Corp Tech Roles"
            value={data.candidate_name}
            onChange={setE('candidate_name')}
            className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-[#FB7414]/25 focus-visible:border-[#FB7414]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-[#334155]">
            Tagline <span className="text-[#94A3B8] font-normal">(optional)</span>
          </Label>
          <Input
            placeholder="e.g. Join our engineering team"
            value={data.tagline}
            onChange={setE('tagline')}
            className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-[#FB7414]/25 focus-visible:border-[#FB7414]"
          />
        </div>
      </div>

      <Separator className="my-8" />

      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-4">Live Preview</p>
      <BrowserMockup name={data.candidate_name} tagline={data.tagline} brandColor={data.brand_color} logo={data.logo} />
    </div>
  );
}