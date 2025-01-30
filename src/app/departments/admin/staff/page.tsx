import { columns } from "@/components/tables/staff-data-table/columns";
import { DataTable } from "@/components/tables/staff-data-table/staff-data-table";


type StaffType ={
    id: number;
    staffId: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    role: string;
    username: string;
  
}
async function getData(): Promise<StaffType[]> {
  // todo: Implement fetch Staff functionality here
  const response = await fetch("http://localhost:8001/contributions", {
    cache: "no-store",
  });
  return await response.json();
}

export default async function AdminStaffPage() {
  const data = await getData();
  return (
    <div className="">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
