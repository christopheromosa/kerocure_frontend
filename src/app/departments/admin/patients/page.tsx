"use client";

import { useState,useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import LoadingPage from "@/components/loading_animation";


type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  dob: string;
  contact_number: string;
};



const PatientsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
   const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 3;




    useEffect(() => {
   async function fetchPatientsData() {
   setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8000/patients/");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setPatientsData(data);
      } catch (err) {
        alert("Failed to load billing records");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatientsData();
  }, []);

  // Filter patients by search
  const filteredPatients = patientsData?.filter((patient) =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  // Paginate results
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const displayedPatients = filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (

    <div className="p-6  rounded-lg shadow-md">
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

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/6">ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedPatients.length > 0 ? (
              displayedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.first_name}</TableCell>
                  <TableCell>{patient.last_name}</TableCell>
                  <TableCell>{patient.dob}</TableCell>
                  <TableCell>{patient.contact_number}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
     
  );
};

export default PatientsTable;
