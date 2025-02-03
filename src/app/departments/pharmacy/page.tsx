import PageTransition from "@/components/PageTransition";
import { PatientType } from "@/components/tables/consultation-data-table/columns";
import { columns } from "@/components/tables/pharmacy-data-table/columns";
import { DataTable } from "@/components/tables/pharmacy-data-table/pharmacy-data-table";
import React from "react";

export async function getPharmacyPatientsData(): Promise<PatientType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8000/api/pharmacy-patients/", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function PharmacyPage() {
  const data = await getPharmacyPatientsData();

  return (
    <PageTransition>
      <div className="">
        <DataTable columns={columns} data={data} />
      </div>
    </PageTransition>
  );
}
