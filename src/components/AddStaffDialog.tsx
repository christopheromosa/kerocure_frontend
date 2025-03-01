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
}: AddStaffDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button className="mt-6">Add Staff</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogDescription>
          Enter the details of the new staff member.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={onInputChange}
          required
        />
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
        <Select
          name="role"
          value={formData.role}
          onValueChange={(value) => onInputChange({ name: "role", value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Role" />
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
        <Input
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={onInputChange}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={onInputChange}
          required
        />
        <Button type="submit">Save</Button>
      </form>
    </DialogContent>
  </Dialog>
);
