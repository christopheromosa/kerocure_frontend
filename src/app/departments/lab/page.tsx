"use client"
import LoadingPage from "@/components/loading_animation";
import PageTransition from "@/components/PageTransition";
import { columns } from "@/components/tables/lab-data-table/columns";
import { DataTable } from "@/components/tables/lab-data-table/lab-data-table";
import React, { useEffect, useState } from "react";



export default  function LabPage() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      async function getLabPatientsData() {
        setIsLoading(true);
        // todo: implement fetch patients functionality
        const response = await fetch(
          "http://localhost:8000/api/consultation-patients/",
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
      getLabPatientsData();
    }, []);
 

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}
      <DataTable columns={columns} data={data} />
    </PageTransition>
  );
}
