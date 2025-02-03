import PageTransition from "@/components/PageTransition";
import { DataTable } from "@/components/tables/billing-data-table/billing-data-table";
import {  columns } from "@/components/tables/billing-data-table/columns";
import { PatientType } from "@/components/tables/consultation-data-table/columns";


import React from "react";

export async function getBillingPatientsData(): Promise<PatientType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8000/api/billing-patients/", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function LabPage() {
  const data = await getBillingPatientsData();


  return (
    <PageTransition>

    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
    </PageTransition>
  );
}
