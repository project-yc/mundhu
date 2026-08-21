import { useState } from 'react';
import { Input } from '../../../../components/ui/input.jsx';
import { Button } from '../../../../components/ui/button.jsx';
import { CandidatePreviewTable } from './CandidatePreviewTable.jsx';

export function IndividualTab({ rows, onAdd, onRemove }) {
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');

  const canAdd = draftEmail.trim().includes('@');

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(draftName.trim(), draftEmail.trim());
    setDraftName('');
    setDraftEmail('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <CandidatePreviewTable rows={rows} showActions onRemove={onRemove} />

      <div className="flex items-end gap-2">
        <div className="flex w-[200px] flex-col gap-2">
          <label className="text-[14px] font-medium text-text-primary">Name</label>
          <Input
            placeholder="E.g. John Doe"
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-[14px] font-medium text-text-primary">Email Address</label>
          <Input
            type="email"
            placeholder="E.g. johndoe234@gmail.com"
            value={draftEmail}
            onChange={e => setDraftEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleAdd} disabled={!canAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
