import {
  columns,
  consultationType,
} from "@/components/tables/consultation-data-table/columns";
import { DataTable } from "@/components/tables/consultation-data-table/consultation-data-table";
import React from "react";

export async function getConsultationData(): Promise<consultationType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8001/members", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function ConsultationPage() {
  // const data = await getConsultationData();
  const data = [];

  return (
    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
