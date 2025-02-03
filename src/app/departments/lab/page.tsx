import PageTransition from "@/components/PageTransition";
import { PatientType } from "@/components/tables/consultation-data-table/columns";
import { columns } from "@/components/tables/lab-data-table/columns";
import { DataTable } from "@/components/tables/lab-data-table/lab-data-table";
import React from "react";

export async function getLabPatientsData(): Promise<PatientType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch(
    "http://localhost:8000/api/consultation-patients/",
    {
      cache: "no-store",
    }
  );
  return await response.json();
}

export default async function LabPage() {
  const data = await getLabPatientsData();

  return (
    <PageTransition>
      <div className="">
        <DataTable columns={columns} data={data} />
      </div>
    </PageTransition>
  );
}
