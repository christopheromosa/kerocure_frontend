
import { columns, LabType } from "@/components/tables/lab-data-table/columns";
import { DataTable } from "@/components/tables/lab-data-table/lab-data-table";
import React from "react";

export async function getLabPatientsData(): Promise<LabType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8000/api/consultation-patients/", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function LabPage() {
  const data = await getLabPatientsData();
  

  return (
    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
