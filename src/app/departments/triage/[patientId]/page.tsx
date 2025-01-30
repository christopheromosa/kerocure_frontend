"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { useParams } from "next/navigation";
import React, { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PatientType } from "@/components/tables/triage-data-table/columns";
import Loading from "@/components/loading";
import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Patient = () => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState<PatientType | null>(null);
  const [weight,setWeight] = useState<string>("");
  const [height,setHeight] = useState<string>("");
  const [bloodPressure,setBloodPressure] = useState<string>("");
  const [bmi,setBMI] = useState<string>("");

  useEffect(() => {
    if (!patientId) return;
    // todo:  patients data from patient db
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
  if (!patientId)
    return (
      <div>
        <Loading />
      </div>
    );
  console.log(patientData);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();


    // TODO: Add api endpoint to post staff data return username and password

    console.log("Submitted contribution data:");
    // Submit contributionData to the server or process it as needed
  };

  return (
    <div className="grid grid-rows-2 border gap-2 p-2 mx-auto md:w-3/4 sm:w-full ">
      <div className="row-span-1 border flex gap-2 p-2">
        <Alert>
          <Terminal />
          <AlertTitle>Patient Details</AlertTitle>
          <AlertDescription>
            <Card className="w-1/2">
              <CardHeader>
                <CardDescription>
                  Patient Name: {patientData?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>ID: {patientData?.id}</p>
                <p>DOB: {patientData?.dob}</p>
                <p>Contact: {patientData?.patientId}</p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-green-400">
                  {patientData?.name.split("")[0]}
                </Badge>
              </CardFooter>
            </Card>
          </AlertDescription>
        </Alert>
      </div>
      <div className="row-span-1 border p-4">
        <Card className="w-1/2">
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Weight
              </Label>
              <Input
                id="weight"
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="height" className="text-right">
                Height
              </Label>
              <Input
                id="height"
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bloodPressure" className="text-right">
                Blood Pressure
              </Label>
              <Input
                id="bloodPressure"
                type="text"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bmi" className="text-right">
                Blood Pressure
              </Label>
              <Input
                id="bmi"
                type="text"
                value={bmi}
                onChange={(e) => setBMI(e.target.value)}
                className="col-span-3"
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Patient;
