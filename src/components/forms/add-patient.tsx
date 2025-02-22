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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { FaMale, FaFemale } from "react-icons/fa"; // Import icons for male and female

export type patientType = {
  patientId: number;
  first_name: string;
  last_name: string;
  dob: Date;
  residence: string;
  contact_number: string;
  next_of_kin_name: string;
  next_of_kin_contact_number: string;
  gender: string; // Add gender field
};

export function AddPatientDialog() {
  const { authState } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [patientId, setPatientId] = useState<number>(0);
  const [first_name, setFirst_name] = useState<string>("");
  const [last_name, setLast_name] = useState<string>("");
  const [residence, setResidence] = useState<string>("");
  const [dob, setDob] = useState<Date>(new Date());
  const [contact_number, setContact_number] = useState<string>("");
  const [next_of_kin_name, setNextOfKinName] = useState<string>("");
  const [next_of_kin_contact_number, setNextOfKinContact_number] =
    useState<string>("");
  const [gender, setGender] = useState<string>("male"); // Add gender state

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const patientData: patientType = {
      patientId,
      first_name,
      last_name,
      dob,
      residence,
      contact_number,
      next_of_kin_name,
      next_of_kin_contact_number,
      gender,
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
      const data = await response.json();
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.non_field_errors[0] || "Patient registration failed"
        );
      }

      // Show success toast after a delay
      setTimeout(() => {
        toast.success(`Patient created successfully! ${data.first_name}`, {
          autoClose: 1000,
        });

        // Set submitted state to true to show patient details
        setIsSubmitted(true);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Patient registration failed. Try again.",
          { delay: 2000 }
        );
      }, 2000);
      setIsOpen(false);
    }
  };

  const resetForm = () => {
    setPatientId(0);
    setFirst_name("");
    setLast_name("");
    setDob(new Date());
    setContact_number("");
    setNextOfKinContact_number("");
    setNextOfKinName("");
    setGender("male");
    setIsSubmitted(false);
  };

  return (
    <>
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
          <Button variant="outline">Add New Patient</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
            <DialogDescription>
              Fill in the details for the Patient and click save when you’re
              done.
            </DialogDescription>
          </DialogHeader>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="residence" className="text-right">
                    Residence
                  </Label>
                  <Input
                    id="residence"
                    type="text"
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="next_of_kin_name" className="text-right">
                    Next of Kin Name
                  </Label>
                  <Input
                    id="next_of_kin_name"
                    type="text"
                    value={next_of_kin_name}
                    onChange={(e) => setNextOfKinName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="next_of_kin_contact_number"
                    className="text-right"
                  >
                    Next of Kin Contact
                  </Label>
                  <Input
                    id="next_of_kin_contact_number"
                    type="text"
                    value={next_of_kin_contact_number}
                    onChange={(e) => setNextOfKinContact_number(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="col-span-3"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" variant="default">
                  Save
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {gender === "male" ? (
                  <FaMale className="h-16 w-16 text-blue-500" />
                ) : (
                  <FaFemale className="h-16 w-16 text-pink-500" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {first_name} {last_name}
                </h2>
                <p>Date of Birth: {dob.toLocaleDateString()}</p>
                <p>Residence: {residence}</p>
                <p>Contact Number: {contact_number}</p>
                <p>Next of Kin: {next_of_kin_name}</p>
                <p>Next of Kin Contact: {next_of_kin_contact_number}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </>
  );
}
