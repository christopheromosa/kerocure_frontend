"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrganizationInfo from "@/components/OrganizationInfo";
import { FaUser } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const triageSchema = z.object({
  weight: z.coerce.string().optional(),
  height: z.coerce.string().optional(),
  systolic: z.coerce.string().optional(),
  diastolic: z.coerce.string().optional(),
  pulse: z.coerce.string().optional(),
  age: z.coerce.string().min(1, "Age is required"),
});

type PatientType = {
  id: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  gender: string;
  residence: string;
};
interface triageType {
  age: string;
  weight: string;
  height: string;
  systolic: string;
  diastolic: string;
  pulse: string;
}
export type DepartmentType = {
  id: string;
  name: string;
};

const Patient = () => {
  const { patientId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [selectedVisitType, setSelectedVisitType] = useState<string | null>(
    null
  );
  const [patientData, setPatientData] = useState<PatientType | null>(null);
  const { authState } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<triageType>({ resolver: zodResolver(triageSchema) });
  const router = useRouter();
  const [showConfirmationDialog, setShowConfirmationDialog] =
    useState<boolean>(false);
  const [triageData, setTriageData] = useState<triageType | null>(null);
  const [visitId, setVisitId] = useState<number | null>(null);

  // Fixed cost for triage
  const TRIAGE_COST = 200; // Ksh 200

  useEffect(() => {
    if (!patientId) return;

    const fetchPatientData = async () => {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:8000/patients/${Number(patientId)}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setPatientData(data);
        setIsLoading(false);
      } else {
        setPatientData(null);
      }
    };

    fetchPatientData();
  }, [patientId, authState?.token]);

  // Fetch departments data
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/departments/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        } else {
          console.error("Failed to fetch departments.");
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, [authState?.token]);

  if (!patientId) return <Loading />;

  const onSubmit = async (data: triageType) => {
    if (!patientId) {
      console.error("No patient ID found.");
      return;
    }
    if (!selectedVisitType) {
      toast.error("Visit type is required");
      return;
    }
    if (!selectedDepartment) {
      toast.error("Department is required");
      return;
    }

    // Set triage data and show confirmation dialog
    // Replace empty fields with "N/A"
    const completeData = {
      ...data,
      weight: data.weight || "N/A",
      height: data.height || "N/A",
      systolic: data.systolic || "N/A",
      diastolic: data.diastolic || "N/A",
      pulse: data.pulse || "N/A",
    };

    setTriageData(completeData);
    setShowConfirmationDialog(true);
  };

  const handleConfirm = async () => {
    if (!triageData || !patientId) return;

    // Create visit instance before submitting triage data
    const visitData = {
      patient: Number(patientId),
      department: selectedDepartment,
      visit_type: selectedVisitType,
      current_state: "TRIAGE",
      next_state: "CONSULTATION",
      total_cost: TRIAGE_COST, // Include the fixed triage cost
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify(visitData),
      });

      if (res.ok) {
        const visit = await res.json();
        setVisitId(visit.visit_id); // Set the visit ID for later use

        // After creating the visit, submit the triage data
        const triagePayload = {
          visit: visit.visit_id,
          vital_signs: {
            age: `${triageData.age} yrs`,
            weight: `${triageData.weight} kg`, // Include units
            height: `${triageData.height} cm`,
            blood_pressure: `${triageData.systolic}/${triageData.diastolic} mmHg`, // Concatenated BP
            pulse: `${triageData.pulse} bpm`,
          },
          recorded_by: authState?.user_id,
        };
        console.log(authState?.user_id);
        const triageRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/triage/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
            body: JSON.stringify(triagePayload),
          }
        );

        if (triageRes.ok) {
          console.log("Triage data submitted successfully!");

          setTimeout(() => {
            toast.success("Patient proceed to consultation successfully!", {
              autoClose: 1000, // Show toast for 2 seconds
              onClose: () => {
                window.location.reload(); // Refresh after the toast disappears
              },
            });
          }, 1000);
          router.push("/departments/triage/patients");
        } else {
          console.error("Failed to submit triage data");
        }
      } else {
        console.error("Failed to create visit");
      }
    } catch (error) {
      setTimeout(() => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Patient registration failed. Try again.",
          {
            autoClose: 1000, // Show toast for 2 seconds
            onClose: () => {
              router.push("/departments/triage");
              window.location.reload(); // Refresh after the toast disappears
            },
          }
        );
      }, 2000);
    } finally {
      setShowConfirmationDialog(false); // Close the confirmation dialog
    }
  };

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}

      <div className="mx-auto space-y-2 w-full">
        {/* Patient Card */}
        {patientData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center uppercase">
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-2 shadow-md rounded-md border w-full">
                {/* Organization Details */}
                <OrganizationInfo />
                {/* Patient Details */}
                <div className="flex justify-around items-center space-x-2">
                  <div className="flex-shrink-0">
                    {patientData.gender === "male" ? (
                      <FaUser className="h-40 w-40 text-blue-500" />
                    ) : (
                      <FaUser className="h-40 w-40 text-pink-500" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>First Name:</strong> {patientData.first_name}
                    </p>
                    <p>
                      <strong>Last Name:</strong> {patientData.last_name}
                    </p>
                    <p>
                      <strong>Residence:</strong> {patientData.residence}
                    </p>
                    <p>
                      <strong>Contact Number:</strong>{" "}
                      {patientData.contact_number}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Triage Form */}
        <Card className="w-full mx-auto p-2 shadow-md border rounded-lg">
          <CardHeader className="text-center font-bold text-lg">
            TRIAGE FORM APPLICATION
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="weight">Weight(Kg) </Label>
                  <Input id="weight" type="text" {...register("weight")} />
                  {errors.weight && (
                    <p className="text-red-500 dark:text-red-500 text-sm">
                      {errors.weight?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="height">Height(cm)</Label>
                  <Input id="height" type="text" {...register("height")} />
                  {errors.height && (
                    <p className="text-red-500 dark:text-red-500 text-sm">
                      {errors.height?.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systolic">Systolic(mmHg)</Label>
                  <Input id="systolic" type="text" {...register("systolic")} />
                  {errors.systolic && (
                    <p className="text-red-500 dark:text-red-500 text-sm">
                      {errors.systolic.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="diastolic">Diastolic(mmHg)</Label>
                  <Input
                    id="diastolic"
                    type="text"
                    {...register("diastolic")}
                  />
                  {errors.diastolic && (
                    <p className="text-red-500 dark:text-red-500 text-sm">
                      {errors.diastolic.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="pulse">Pulse / Min (bpm)</Label>
                <Input id="pulse" type="text" {...register("pulse")} />
                {errors.pulse && (
                  <p className="text-red-500 dark:text-red-500 text-sm">
                    {errors.pulse.message as string}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="age">Age(yrs) </Label>
                <Input id="age" type="text" {...register("age")} />
                {errors.weight && (
                  <p className="text-red-500 dark:text-red-500 text-sm">
                    {errors.age?.message as string}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visit_type">Send to:</Label>
                <select
                  id="visit_type"
                  className="border rounded p-2"
                  onChange={(e) => setSelectedVisitType(e.target.value)}
                  value={selectedVisitType || ""}
                >
                  <option value="">Select Visit Type</option>
                  <option value="Outpatient">Outpatient</option>
                  <option value="Inpatient">Inpatient</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Send to:</Label>
                <select
                  id="department"
                  className="border rounded p-2"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  value={selectedDepartment || ""}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="submit"
                className="bg-blue-500 dark:bg-blue-500 text-white"
              >
                Save
              </Button>
              <Button
                type="button"
                className="bg-gray-400 dark:bg-gray-400 text-white"
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Please confirm the payment before proceeding to the next
              department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              <strong>Consultation Fee:</strong> Ksh {TRIAGE_COST.toFixed(2)}
            </p>
            <p>
              <strong>Total Amount to Pay:</strong> Ksh {TRIAGE_COST.toFixed(2)}
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirm}>Confirm and Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </PageTransition>
  );
};

export default Patient;
