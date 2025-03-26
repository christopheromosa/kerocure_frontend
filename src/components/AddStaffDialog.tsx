import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge"; // For displaying selected roles as chips

interface AddStaffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  onInputChange: (e: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddStaffDialog = ({
  isOpen,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
}: AddStaffDialogProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleChange = (value: string) => {
    let updatedRoles;
    if (selectedRoles.includes(value)) {
      updatedRoles = selectedRoles.filter((role) => role !== value);
    } else {
      updatedRoles = [...selectedRoles, value];
    }
    setSelectedRoles(updatedRoles);
    // Update formData.roles immediately
    onInputChange({ target: { name: "roles", value: updatedRoles } });
  };

  const handleRemoveRole = (role: string) => {
    const updatedRoles = selectedRoles.filter((r) => r !== role);
    setSelectedRoles(updatedRoles);
    // Update formData.roles immediately
    onInputChange({ target: { name: "roles", value: updatedRoles } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="mt-6 bg-blue-500 hover:bg-blue-600 dark:text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
          <DialogDescription>
            Enter the details of the new staff member.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          className="space-y-4"
        >
          <Input
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={onInputChange}
            required
          />
          <Input
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={onInputChange}
            required
          />

          <Input
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={onInputChange}
            required
          />

          {/* Multi-select dropdown for roles */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Roles</label>
            <Select onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Triage">Triage</SelectItem>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="Lab Technician">Lab Technician</SelectItem>
                <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Billing">Billing</SelectItem>
              </SelectContent>
            </Select>

            {/* Display selected roles as chips */}
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((role) => (
                <Badge
                  key={role}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="text-sm text-red-500 hover:text-red-700 dark:text-red-500 dark:hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
