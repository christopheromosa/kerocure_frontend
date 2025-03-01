import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the type for the drug object
interface Drug {
  drug_name?: string;
  cost?: number;
  quantity?: number;
  status?: string;
}

// Define the props for the DrugForm component
interface DrugFormProps {
  drug?: Drug; // Optional drug object for editing
  onSubmit: (drug: Drug) => void; // Function to handle form submission
  onCancel: () => void; // Function to handle cancel action
}

export function DrugForm({ drug, onSubmit, onCancel }: DrugFormProps) {
  // State for form fields
  const [drugName, setDrugName] = useState(drug?.drug_name || "");
  const [cost, setCost] = useState(drug?.cost || 0);
  const [quantity, setQuantity] = useState(drug?.quantity || 0);
  const [status, setStatus] = useState(drug?.status || "Available");

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      drug_name: drugName,
      cost: parseFloat(cost.toString()), // Ensure cost is a number
      quantity: parseInt(quantity.toString()), // Ensure quantity is a number
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drug Name Field */}
      <div>
        <Label>Drug Name</Label>
        <Input
          value={drugName}
          onChange={(e) => setDrugName(e.target.value)}
          required
        />
      </div>

      {/* Cost Field */}
      <div>
        <Label>Cost</Label>
        <Input
          type="number"
          value={cost}
          onChange={(e) => setCost(parseFloat(e.target.value))}
          required
        />
      </div>

      {/* Quantity Field */}
      <div>
        <Label>Quantity</Label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          required
        />
      </div>

      {/* Status Field */}
      <div>
        <Label>Status</Label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="Available">Available</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
