"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LoadingPage from "@/components/loading_animation";
import { AddPatientDialog } from "@/components/forms/add-patient";

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  dob: string;
  residence: string;
  contact_number: string;
  next_of_kin_name: string;
  next_of_kin_contact_number: string;
  gender: string;
};

const AdminPatientsPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 7;
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchPatientsData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/patients/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setPatientsData(data);
      } catch (err) {
        toast.error("Failed to load patients");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatientsData();
  }, [authState?.token]);

  // Filter patients by search
  const filteredPatients = patientsData?.filter((patient) =>
    `${patient.first_name} ${patient.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Paginate results
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const displayedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle delete
  const handleDelete = async (patientId: number) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/patients/${patientId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to delete patient");
        toast.success("Patient deleted successfully");
        setPatientsData(patientsData.filter((patient) => patient.id !== patientId));
      } catch (error) {
        toast.error("Failed to delete patient");
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6 rounded-lg shadow-md">
      {isLoading && <LoadingPage />}
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search patients..."
          className="w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AddPatientDialog />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Residence</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Next of Kin</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedPatients.length > 0 ? (
              displayedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.first_name}</TableCell>
                  <TableCell>{patient.last_name}</TableCell>
                  <TableCell>{patient.dob}</TableCell>
                  <TableCell>{patient.residence}</TableCell>
                  <TableCell>{patient.contact_number}</TableCell>
                  <TableCell>{patient.next_of_kin_name}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-white"
                      onClick={() => router.push(`/departments/admin/patients/${patient.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(patient.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No patients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={16} /> Prev
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminPatientsPage;
