"use client";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";


export type staffType = {
  staffId: string;
  firstName: string;
  lastName: string;
  role:string;
  contactNumber: string;
};

export function AddStaffDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [staffId, setStaffId] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const staffData: staffType = {
      staffId,
      firstName,
      lastName,
      contactNumber,
      role,

    };

    // TODO: Add api endpoint to post staff data return username and password

    console.log("Submitted contribution data:", staffData);
    // Submit contributionData to the server or process it as needed
  };

  const resetForm = () => {
    setStaffId("");
    setFirstName("");
    setLastName("");
    setContactNumber("");
    setRole("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Add Staff</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Staff</DialogTitle>
          <DialogDescription>
            Fill in the details for the Staff and click save when you’re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              First Name
            </Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactNumber" className="text-right">
              Contact Number
            </Label>
            <Input
              id="contactNumber"
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            contact
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "Active" | "Inactive")}
              className="col-span-3 p-2 border rounded-md"
            >
              <option value="" disabled>
                Select an Role
              </option>
              <option value="triage">triage</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab-technician">Lab Technician</option>
              <option value="accountant">Accountant</option>
              <option value="other">Other</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit">Save Staff</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
