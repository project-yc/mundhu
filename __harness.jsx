import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './src/components/ui/select';

function Harness() {
  return (
    <div className="bg-page p-10">
      <Select defaultValue="mid">
        <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="entry">Entry level</SelectItem>
          <SelectItem value="junior">Junior</SelectItem>
          <SelectItem value="mid">Mid</SelectItem>
          <SelectItem value="senior">Senior</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="principal">Principal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<Harness />);
