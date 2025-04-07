// import SuccessDialog from "@/components/SuccessDialog";
"use client";
import { AddPatientDialog } from "@/components/forms/add-patient";
import LoadingPage from "@/components/loading_animation";
import PageTransition from "@/components/PageTransition";
import { columns } from "@/components/tables/triage-data-table/columns";
import { DataTable } from "@/components/tables/triage-data-table/triage-data-table";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function TriagePage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();

  useEffect(() => {
    async function getPatientsData() {
      setIsLoading(true);
      // todo: implement fetch patients functionality
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          cache: "no-store",
        }
      );
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
        setIsLoading(false);
      }
    }
    getPatientsData();
  }, [authState?.token]);

  const handleRefresh = () => {
    window.location.reload();
  };
  return (
    <PageTransition>
      {isLoading && <LoadingPage />}

      <div className="flex flex-col">
        {/* <SuccessDialog/> */}
        <div className="p-2 ml-2 float-left flex justify-between">
          <AddPatientDialog />
          <Button onClick={handleRefresh}>Refresh Page</Button>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </PageTransition>
  );
}
