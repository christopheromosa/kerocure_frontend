import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const LabTestForm = ({ labTest, onSubmit, onCancel }: any) => {
  const [service, setService] = useState(labTest?.service || "");
  const [cost, setCost] = useState(labTest?.cost || "");
  const [duration, setDuration] = useState(labTest?.duration || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ service, cost, duration });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Service"
        value={service}
        onChange={(e) => setService(e.target.value)}
        required
      />
      <Input
        placeholder="Cost"
        type="number"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        required
      />
      <Input
        placeholder="Duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        required
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};
