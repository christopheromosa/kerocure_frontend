// import SuccessDialog from "@/components/SuccessDialog";
"use client"
import LoadingPage from "@/components/loading_animation";
import PageTransition from "@/components/PageTransition";
import { columns } from "@/components/tables/triage-data-table/columns";
import { DataTable } from "@/components/tables/triage-data-table/triage-data-table";
import { useEffect, useState } from "react";

export default function TriagePage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getPatientsData() {
      setIsLoading(true);
      // todo: implement fetch patients functionality
      const response = await fetch("http://localhost:8000/patients", {
        cache: "no-store",
      });
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
        setIsLoading(false);
      }
    }
    getPatientsData();
  }, []);

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}
      <div className="">
        {/* <SuccessDialog/> */}
        <DataTable columns={columns} data={data} />
      </div>
    </PageTransition>
  );
}
