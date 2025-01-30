"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

const triageSchema = z.object({
  patientName: z.string().min(1, "Patient Name is required"),
  weight: z.coerce.number().min(1, "Weight must be a valid number"),
  height: z.coerce.number().min(1, "Height must be a valid number"),
  systolic: z.coerce.number().min(1, "Systolic pressure is required"),
  diastolic: z.coerce.number().min(1, "Diastolic pressure is required"),
  pulse: z.coerce.number().min(1, "Pulse rate is required"),
});

type PatientType = {
  id: string;
  name: string;
  dob: string;
  phone: string;
};

const Patient = () => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState<PatientType | null>(null);

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({ resolver: zodResolver(triageSchema) });

const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    const fetchPatientData = async () => {
      const res = await fetch(
        `http://localhost:8001/members?memberId=${patientId}`
      );
      if (res.ok) {
        const data = await res.json();
        setPatientData(data[0]);
      } else {
        setPatientData(null);
      }
    };
    fetchPatientData();
  }, [patientId]);

  if (!patientId) return <Loading />;

 const onSubmit = (data) => {
   setFormData(data);
   console.log("Form Data Submitted:", formData);
 };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Patient Card */}
      {patientData && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {patientData.name}
              </p>
              <p>
                <strong>ID:</strong> {patientData.id}
              </p>
              <p>
                <strong>DOB:</strong> {patientData.dob}
              </p>
              <p>
                <strong>Contact:</strong> {patientData.phone}
              </p>
            </div>
            <Badge className="mt-2">{patientData.name[0]}</Badge>
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
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input id="patientName" {...register("patientName")} />
              {errors.patientName && (
                <p className="text-red-500 text-sm">
                  {errors.patientName?.message as string}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" type="number" {...register("weight")} />
                {errors.weight && (
                  <p className="text-red-500 text-sm">
                    {errors.weight?.message as string}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input id="height" type="number" {...register("height")} />
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
                <Input id="systolic" type="number" {...register("systolic")} />
                {errors.systolic && (
                  <p className="text-red-500 text-sm">
                    {errors.systolic.message as string}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="pulse">Pulse / Min</Label>
                <Input id="pulse" type="number" {...register("pulse")} />
                {errors.pulse && (
                  <p className="text-red-500 text-sm">
                    {errors.pulse.message as string}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="diastolic">Diastolic</Label>
              <Input id="diastolic" type="number" {...register("diastolic")} />
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
  );
};

export default Patient;
