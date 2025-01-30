import { DataTable } from "@/components/tables/billing-data-table/billing-data-table";
import { BillingType, columns } from "@/components/tables/billing-data-table/columns";


import React from "react";

export async function getMemberData(): Promise<BillingType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8001/members", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function LabPage() {
  const data = await getMemberData();

  return (
    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
