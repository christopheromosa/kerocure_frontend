"use client";
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
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export type patientType = {
  patientId: number;
  first_name: string;
  last_name: string;
  dob: Date;
  contact_number: string;
};

export function AddPatientDialog() {
  const {authState} = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [patientId, setPatientId] = useState<number>(0);
  const [first_name, setFirst_name] = useState<string>("");
  const [last_name, setLast_name] = useState<string>("");
  const [dob, setDob] = useState<Date>(new Date());
  const [contact_number, setContact_number] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {

    e.preventDefault();
    const patientData: patientType = {
      patientId,
      first_name,
      last_name,
      dob,
      contact_number,
    };
    console.log(patientData);
    const formattedDob = dob.toISOString().split("T")[0];
    try {
      const response = await fetch("http://localhost:8000/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify({ ...patientData, dob: formattedDob }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.non_field_errors[0] || "Patients Registration failed"
        );
      }
    } catch (error) {
      console.error(error);
    }

    // TODO: Add api endpoint to post patient data return first_name and last_name
  };
  const resetForm = () => {
    setPatientId(0);
    setFirst_name("");
    setLast_name("");
    setDob(new Date());
    setContact_number("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Add Patient</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Patient</DialogTitle>
          <DialogDescription>
            Fill in the details for the Patient and click save when you’re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="first_name" className="text-right">
              First Name
            </Label>
            <Input
              id="first_name"
              type="text"
              value={first_name}
              onChange={(e) => setFirst_name(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_name" className="text-right">
              Last Name
            </Label>
            <Input
              id="last_name"
              type="text"
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dob" className="text-right">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={dob.toISOString().split("T")[0]}
              onChange={(e) => setDob(new Date(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact_number" className="text-right">
              Contact Number
            </Label>
            <Input
              id="contact_number"
              type="text"
              value={contact_number}
              onChange={(e) => setContact_number(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="default">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
