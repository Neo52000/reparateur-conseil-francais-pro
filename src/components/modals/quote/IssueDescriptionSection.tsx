
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface IssueDescriptionSectionProps {
  issueDescription: string;
  onIssueDescriptionChange: (value: string) => void;
}

const IssueDescriptionSection: React.FC<IssueDescriptionSectionProps> = ({
  issueDescription,
  onIssueDescriptionChange
}) => {
  return (
    <div>
      <Label htmlFor="issue_description">Description du problème</Label>
      <Textarea
        id="issue_description"
        value={issueDescription}
        onChange={(e) => onIssueDescriptionChange(e.target.value)}
        placeholder="Décrivez le problème en détail..."
        rows={4}
      />
    </div>
  );
};

export default IssueDescriptionSection;
