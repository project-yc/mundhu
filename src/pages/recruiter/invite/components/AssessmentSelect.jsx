import { Loader } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select.jsx';

export function AssessmentSelect({ assessments, selectedId, onSelect, loading }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-[14px] font-medium text-text-primary">Assessment name</label>
      {loading ? (
        <div className="flex h-[42px] items-center gap-2 rounded-[8px] border border-border-default bg-surface px-3 text-[14px] text-text-secondary">
          <Loader className="h-3.5 w-3.5 animate-spin" />
          Loading assessments…
        </div>
      ) : (
        <Select value={selectedId} onValueChange={onSelect} disabled={assessments.length === 0}>
          <SelectTrigger aria-label="Select assessment" className="h-[42px] w-full rounded-[8px] px-[10px] text-[14px]">
            <SelectValue placeholder="Select an assessment…" />
          </SelectTrigger>
          <SelectContent>
            {assessments.map(a => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
