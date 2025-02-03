import SuccessDialog from "@/components/SuccessDialog";
import { columns, PatientType } from "@/components/tables/triage-data-table/columns";
import { DataTable } from "@/components/tables/triage-data-table/triage-data-table";


export async function getPatientsData(): Promise<PatientType[]> {
  // todo: implement fetch patients functionality
  const response = await fetch("http://localhost:8000/patients", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function TriagePage() {
 
      const data = await getPatientsData(); 
    console.log(data);

  return (
    <div className="">
      <SuccessDialog/>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
