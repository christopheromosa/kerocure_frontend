"use client"
import { columns } from "@/components/tables/consultation-data-table/columns";
import { DataTable } from "@/components/tables/consultation-data-table/consultation-data-table";
import React, { useEffect, useState } from "react";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";



export default function ConsultationPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getTriagedPatientsData() {
      setIsLoading(true);
      // todo: implement fetch patients functionality
      const response = await fetch(
        "http://localhost:8000/api/triage-patients/",
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
    getTriagedPatientsData();
  }, []);

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}
      <DataTable columns={columns} data={data} />
    </PageTransition>
  );
}
