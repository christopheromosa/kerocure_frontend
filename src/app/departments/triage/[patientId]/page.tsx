"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const triageSchema = z.object({
  weight: z.coerce.string().min(1, "Weight is required"),
  height: z.coerce.string().min(1, "Height is required"),
  systolic: z.coerce.string().min(1, "Systolic pressure is required"),
  diastolic: z.coerce.string().min(1, "Diastolic pressure is required"),
  pulse: z.coerce.string().min(1, "Pulse rate is required"),
});

type PatientType = {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  contact_number: string;
};
interface triageType {
  weight: string;
  height: string;
  systolic: string;
  diastolic: string;
  pulse: string;
}

const Patient = () => {
  const { patientId } = useParams();
  console.log(patientId);
  const [isLoading, setIsLoading] = useState(false);

  const [patientData, setPatientData] = useState<PatientType | null>(null);
  const { authState } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<triageType>({ resolver: zodResolver(triageSchema) });

  // const [visitId, setVisitId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!patientId) return;
    console.log(patientId);

    const fetchPatientData = async () => {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:8000/patients/${Number(patientId)}/`
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

  if (!patientId) return <Loading />;

  const onSubmit = async (data: triageType) => {
    if (!patientId) {
      console.error("No patient ID found.");
      return;
    }

    // Create visit instance before submitting triage data
    const visitData = {
      patient: Number(patientId),
      current_state: "TRIAGE",
      next_state: "CONSULTATION",
      total_cost: 0,
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
        // setVisitId(visit.visit_id); // Set the visit ID for later use

        // After creating the visit, submit the triage data
        const triageData = {
          visit: visit.visit_id,
          vital_signs: {
            weight: data.weight,
            height: data.height,
            systolic: data.systolic,
            diastolic: data.diastolic,
            pulse: data.pulse,
          },
          recorded_by: authState?.username,
        };
        console.log(triageData);

        const triageRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/triage/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
            body: JSON.stringify(triageData),
          }
        );

        if (triageRes.ok) {
          console.log("Triage data submitted successfully!");

          setTimeout(() => {
            toast.success("Patient proceed to consultation successfully!", {
              autoClose: 1000, // Show toast for 2 seconds
              onClose: () => {
                router.push("/departments/triage");
                window.location.reload(); // Refresh after the toast disappears
              },
            });
          }, 1000);
          router.push("/departments/triage");
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
    }
  };

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}

      <div className="max-w-2xl mx-auto space-y-6 p-4">
        {/* Patient Card */}
        {patientData && (
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {/* Patient Badge with Full Name */}
                <Badge className="px-4 py-2 text-lg">{`${patientData.first_name} ${patientData.last_name}`}</Badge>

                {/* Patient Details in a Row */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <p>
                    <strong>ID:</strong> {patientData.id}
                  </p>
                  <p>
                    <strong>DOB:</strong> {patientData.dob}
                  </p>
                  <p>
                    <strong>Contact:</strong> {patientData.contact_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Triage Form */}

        <Card className="w-full max-w-md mx-auto p-6 shadow-md border rounded-lg">
          <CardHeader className="text-center font-bold text-lg">
            TRIAGE FORM APPLICATION
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input id="weight" type="text" {...register("weight")} />
                  {errors.weight && (
                    <p className="text-red-500 text-sm">
                      {errors.weight?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input id="height" type="text" {...register("height")} />
                  {errors.height && (
                    <p className="text-red-500 text-sm">
                      {errors.height?.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systolic">Systolic</Label>
                  <Input id="systolic" type="text" {...register("systolic")} />
                  {errors.systolic && (
                    <p className="text-red-500 text-sm">
                      {errors.systolic.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pulse">Pulse / Min</Label>
                  <Input id="pulse" type="text" {...register("pulse")} />
                  {errors.pulse && (
                    <p className="text-red-500 text-sm">
                      {errors.pulse.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="diastolic">Diastolic</Label>
                <Input id="diastolic" type="text" {...register("diastolic")} />
                {errors.diastolic && (
                  <p className="text-red-500 text-sm">
                    {errors.diastolic.message as string}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit" className="bg-blue-500 text-white">
                Save
              </Button>
              <Button type="button" className="bg-gray-400 text-white">
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <ToastContainer />
    </PageTransition>
  );
};

export default Patient;
