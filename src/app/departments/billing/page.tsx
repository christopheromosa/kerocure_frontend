"use client"
import LoadingPage from "@/components/loading_animation";
import PageTransition from "@/components/PageTransition";
import { DataTable } from "@/components/tables/billing-data-table/billing-data-table";
import {  columns } from "@/components/tables/billing-data-table/columns";


import React, { useEffect, useState } from "react";



export default function LabPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getBillingPatientsData() {
      setIsLoading(true);
      // todo: implement fetch patients functionality
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing-patients/`,
        {
          cache: "no-store",
        }
      );
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
        setIsLoading(false);
      }
    }
    getBillingPatientsData();
  }, []);

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}

      <div className="">
        <DataTable columns={columns} data={data} />
      </div>
    </PageTransition>
  );
}
