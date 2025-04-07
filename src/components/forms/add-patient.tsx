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
import { FaMale, FaFemale } from "react-icons/fa";

export type patientType = {
  patientId: number;
  first_name: string;
  last_name: string;
  residence: string;
  contact_number: string;
  gender: string;
};

export function AddPatientDialog() {
  const { authState } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patientId, setPatientId] = useState<number>(0);
  const [first_name, setFirst_name] = useState<string>("");
  const [last_name, setLast_name] = useState<string>("");
  const [residence, setResidence] = useState<string>("");
  const [contact_number, setContact_number] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!first_name.trim()) newErrors.first_name = "First name is required";
    if (!last_name.trim()) newErrors.last_name = "Last name is required";
    if (!residence.trim()) newErrors.residence = "Residence is required";
    if (!contact_number.trim())
      newErrors.contact_number = "Contact number is required";
    if (!/^\d{10,15}$/.test(contact_number))
      newErrors.contact_number = "Invalid phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkForDuplicate = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/patients/check-duplicate/?first_name=${encodeURIComponent(
          first_name
        )}&last_name=${encodeURIComponent(
          last_name
        )}&contact_number=${encodeURIComponent(contact_number)}`,
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Duplicate check failed");

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Duplicate check error:", error);
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // First check for duplicate
      const isDuplicate = await checkForDuplicate();
      if (isDuplicate) {
        toast.error("Patient already exists with these details");
        setIsLoading(false);
        return;
      }

      const patientData: patientType = {
        patientId,
        first_name,
        last_name,
        residence,
        contact_number,
        gender,
      };

      const response = await fetch("http://localhost:8000/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.non_field_errors?.[0] ||
            errorData.message ||
            "Patient registration failed"
        );
      }

      const data = await response.json();
      toast.success(
        `Patient created successfully: ${data.first_name} ${data.last_name}`,
        { autoClose: 2000 }
      );

      setIsSubmitted(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Patient registration failed",
        { autoClose: 2000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPatientId(0);
    setFirst_name("");
    setLast_name("");
    setContact_number("");
    setResidence("");
    setGender("Male");
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Add New Patient
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
            <DialogDescription>
              Fill in the details for the Patient and click save when you are
              done.
            </DialogDescription>
          </DialogHeader>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="first_name" className="text-right">
                    First Name*
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="first_name"
                      value={first_name}
                      onChange={(e) => setFirst_name(e.target.value)}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-500">
                        {errors.first_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Last Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="last_name" className="text-right">
                    Last Name*
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="last_name"
                      value={last_name}
                      onChange={(e) => setLast_name(e.target.value)}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-500">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Residence */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="residence" className="text-right">
                    Residence*
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="residence"
                      value={residence}
                      onChange={(e) => setResidence(e.target.value)}
                    />
                    {errors.residence && (
                      <p className="text-sm text-red-500">{errors.residence}</p>
                    )}
                  </div>
                </div>

                {/* Contact Number */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact_number" className="text-right">
                    Contact Number*
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="contact_number"
                      value={contact_number}
                      onChange={(e) => setContact_number(e.target.value)}
                    />
                    {errors.contact_number && (
                      <p className="text-sm text-red-500">
                        {errors.contact_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gender */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="col-span-3 border rounded-md p-2"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Patient"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="flex flex-col items-center space-y-4 p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {gender === "Male" ? (
                    <FaMale className="h-16 w-16 text-blue-500" />
                  ) : (
                    <FaFemale className="h-16 w-16 text-pink-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Name:{first_name} {last_name}
                  </h2>
                  <p>Residence: {residence}</p>
                  <p>Contact: {contact_number}</p>
                  <p>Gender: {gender}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  router.refresh();
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </>
  );
}
