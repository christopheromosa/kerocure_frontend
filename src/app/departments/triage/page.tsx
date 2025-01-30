import { columns, PatientType } from "@/components/tables/triage-data-table/columns";
import { DataTable } from "@/components/tables/triage-data-table/triage-data-table";
import React from "react";



export async function getMemberData(): Promise<PatientType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8001/members", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function MembersPage() {
  const data = await getMemberData();

  return (
    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
