import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const DrugForm = ({ drug, onSubmit, onCancel }: any) => {
  const [drugName, setDrugName] = useState(drug?.drug_name || "");
  const [cost, setCost] = useState(drug?.cost || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ drug_name: drugName, cost });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Drug Name"
        value={drugName}
        onChange={(e) => setDrugName(e.target.value)}
        required
      />
      <Input
        placeholder="Cost"
        type="number"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
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
