"use client";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Staff } from "@/app/departments/admin/staff/page";
import { Input } from "./ui/input";
import { Badge } from "@/components/ui/badge"; // For displaying selected roles as chips
import { useState, useEffect } from "react";

interface EditStaffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStaff: Staff | null;
  formData: any;
  onInputChange: (e: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditStaffDialog = ({
  isOpen,
  onOpenChange,
  selectedStaff,
  formData,
  onInputChange,
  onSubmit,
}: EditStaffDialogProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Initialize selected roles when the dialog opens or selectedStaff changes
  useEffect(() => {
    if (selectedStaff && selectedStaff.roles) {
      setSelectedRoles(selectedStaff.roles);
    }
  }, [selectedStaff]);

  const handleRoleChange = (value: string) => {
    let updatedRoles;
    if (selectedRoles.includes(value)) {
      updatedRoles = selectedRoles.filter((role) => role !== value);
    } else {
      updatedRoles = [...selectedRoles, value];
    }
    setSelectedRoles(updatedRoles);
    onInputChange({ target: { name: "roles", value: updatedRoles } });
  };

  const handleRemoveRole = (role: string) => {
    const updatedRoles = selectedRoles.filter((r) => r !== role);
    setSelectedRoles(updatedRoles);
    onInputChange({ target: { name: "roles", value: updatedRoles } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Staff</DialogTitle>
          <DialogDescription>
            Update the details of {selectedStaff?.username}.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onInputChange({ target: { name: "roles", value: selectedRoles } });
            onSubmit(e);
          }}
          className="space-y-4"
        >
          {/* Username */}
          <Input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={onInputChange}
            required
          />

          {/* First Name */}
          <Input
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={onInputChange}
            required
          />

          {/* Last Name */}
          <Input
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
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
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <Input
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={onInputChange}
            required
          />

          {/* Is Staff Checkbox */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_staff"
                checked={formData.is_staff}
                onChange={(e) =>
                  onInputChange({ name: "is_staff", value: e.target.checked })
                }
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span>Is Staff</span>
            </label>

            {/* Is Active Checkbox */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  onInputChange({ name: "is_active", value: e.target.checked })
                }
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span>Is Active</span>
            </label>
          </div>

          {/* Save Changes Button */}
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
