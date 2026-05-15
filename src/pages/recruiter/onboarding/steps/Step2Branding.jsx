import { useRef, useState } from 'react';
import { Palette, Upload, X, FileImage } from 'lucide-react';

const PRESET_COLORS = [
  '#22D3EE', // Cyan
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#1D4ED8', // Blue
  '#0F172A', // Slate 900
];

function LogoUpload({ file, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (f && f.type.startsWith('image/')) onChange(f);
  };

  return (
    <div>
      <p className="text-[13px] font-semibold text-[#0F172A] mb-2">Workspace Logo</p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={`relative flex flex-col items-center justify-center w-full h-28 rounded-[10px] border-2 border-dashed cursor-pointer transition-colors ${
          dragOver
            ? 'border-[#22D3EE] bg-[#E0F9FC]'
            : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#22D3EE] hover:bg-[#E0F9FC]'
        }`}
      >
        {file ? (
          <>
            <img
              src={URL.createObjectURL(file)}
              alt="logo preview"
              className="h-16 w-auto max-w-[120px] object-contain rounded-[6px]"
            />
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
            <div className="w-9 h-9 rounded-xl border-2 border-dashed border-[#CBD5E1] flex items-center justify-center mb-2">
              <FileImage className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <p className="text-[12px] text-[#64748B] font-medium">
              <span className="text-[#0E7490]">Click to upload</span> or drag & drop
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">Square image, max 2 MB</p>
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
      className={`w-8 h-8 rounded-full transition-all ${selected ? 'ring-2 ring-offset-2 ring-[#22D3EE] scale-110' : 'hover:scale-105'}`}
      style={{ backgroundColor: color }}
    />
  );
}

function PreviewCard({ name, brandColor }) {
  const displayName = name || 'Acme Corp Tech Roles';
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 shadow-[0_1px_3px_0_rgba(15,40,84,0.06)]">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[12px]"
          style={{ backgroundColor: brandColor }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-[13px] font-semibold text-[#0E7490] truncate">{displayName}</span>
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-2 bg-[#F1F5F9] rounded-full w-full" />
        <div className="h-2 bg-[#F1F5F9] rounded-full w-3/4" />
      </div>
      <button
        type="button"
        className="text-[11px] font-semibold px-3 py-1.5 rounded-[6px] text-white"
        style={{ backgroundColor: brandColor }}
      >
        &lt;/&gt; Open IDE
      </button>
    </div>
  );
}

export default function Step2Branding({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });
  const setE = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white border border-[#E2E8F0] rounded-[14px] shadow-[0_1px_3px_0_rgba(15,40,84,0.04),0_1px_2px_-1px_rgba(15,40,84,0.06)] overflow-hidden">

        {/* Card header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-xl bg-[#CFFAFE] flex items-center justify-center mb-4">
            <Palette className="w-5 h-5 text-[#0E7490]" />
          </div>
          <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
            Brand your workspace
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1.5">
            Customize how your workspace looks to candidates.
          </p>
        </div>

        {/* Two column body */}
        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">

          {/* Left — inputs */}
          <div className="px-8 py-6 space-y-6">
            {/* Logo */}
            <LogoUpload file={data.logo} onChange={set('logo')} />

            {/* Brand color */}
            <div>
              <p className="text-[13px] font-semibold text-[#0F172A] mb-2">Brand Color</p>
              <div className="flex items-center gap-2.5 mb-3">
                {PRESET_COLORS.map(c => (
                  <ColorSwatch key={c} color={c} selected={data.brand_color === c} onClick={set('brand_color')} />
                ))}
              </div>
              <div className="flex items-center gap-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[8px] px-3 h-10">
                <div
                  className="w-4 h-4 rounded-full border border-[#E2E8F0] flex-shrink-0"
                  style={{ backgroundColor: data.brand_color }}
                />
                <span className="text-[12px] text-[#94A3B8] font-mono">#</span>
                <input
                  className="flex-1 bg-transparent text-[13px] text-[#0F172A] font-mono outline-none"
                  value={data.brand_color.replace('#', '')}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                    if (v.length === 6) set('brand_color')(`#${v}`);
                  }}
                  maxLength={6}
                />
              </div>
            </div>

            {/* Candidate-facing name */}
            <div>
              <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">
                Candidate-Facing Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp Tech Roles"
                value={data.candidate_name}
                onChange={setE('candidate_name')}
                className="w-full h-10 px-3.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#22D3EE] focus:bg-white transition-colors"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">
                Tagline <span className="text-[#94A3B8] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Join our engineering team"
                value={data.tagline}
                onChange={setE('tagline')}
                className="w-full h-10 px-3.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#22D3EE] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Right — live preview */}
          <div className="px-8 py-6 bg-[#F8FAFC]">
            <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[1.2px] mb-4">
              What your candidate sees
            </p>
            <PreviewCard name={data.candidate_name} brandColor={data.brand_color} />
          </div>

        </div>
      </div>
    </div>
  );
}
