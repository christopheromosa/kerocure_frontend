import { columns } from "@/components/tables/consultation-data-table/columns";
import { DataTable } from "@/components/tables/consultation-data-table/consultation-data-table";
import React from "react";
import {
  PatientType,
} from "@/components/tables/triage-data-table/columns";

export async function getTriagedPatientsData(): Promise<PatientType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8000/api/triage-patients/", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function ConsultationPage() {
  const data = await getTriagedPatientsData();
  

  return (
    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
