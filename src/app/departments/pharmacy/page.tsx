
import { columns, MedicationType } from "@/components/tables/pharmacy-data-table/columns";
import { DataTable } from "@/components/tables/pharmacy-data-table/pharmacy-data-table";
import React from "react";

export async function getPharmacyPatientsData(): Promise<MedicationType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8000/api/pharmacy-patients/", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function PharmacyPage() {
  const data = await getPharmacyPatientsData();


  return (
    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
