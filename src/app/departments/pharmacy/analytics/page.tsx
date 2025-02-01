import {
  columns,
  MedicationType,
} from "@/components/tables/pharmacy-data-table/columns";
import { DataTable } from "@/components/tables/pharmacy-data-table/pharmacy-data-table";
import React from "react";

export async function getPharmacyData(): Promise<MedicationType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8001/members", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function PharmacyPage() {
  // const data = await getPharmacyData();
  const data = [];

  return (
    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
