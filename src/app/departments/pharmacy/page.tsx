"use client";
import LoadingPage from "@/components/loading_animation";
import PageTransition from "@/components/PageTransition";
import { columns } from "@/components/tables/pharmacy-data-table/columns";
import { DataTable } from "@/components/tables/pharmacy-data-table/pharmacy-data-table";
import React, { useEffect, useState } from "react";

export default function PharmacyPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getPharmacyPatientsData() {
      setIsLoading(true);
      // todo: implement fetch patients functionality
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pharmacy-patients`,
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
    getPharmacyPatientsData();
  }, []);

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}
      <DataTable columns={columns} data={data} />
    </PageTransition>
  );
}
