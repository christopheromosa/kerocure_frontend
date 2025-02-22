"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PatientType = {
  id: number;
  first_name: string;
  last_name: string;
  dob: Date;
  residence: string;
  contact_number: string;
  next_of_kin_name: string;
  next_of_kin_contact_number: string;
  gender: string;
};

export default function PatientList() {
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { authState } = useAuth();
  const router = useRouter();

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:8000/patients/", {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch patients");
        const data = await response.json();
        console.log(data);

        setPatients(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPatients();
  }, [authState?.token]);

  // Handle delete
  const handleDelete = async (patientId: number) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/patients/${patientId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to delete patient");
        toast.success("Patient deleted successfully");
        setPatients(patients.filter((patient) => patient.id !== patientId));
      } catch (error) {
        toast.error("Failed to delete patient");
      }
    }
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter(
    (patient) =>
      patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.residence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contact_number.includes(searchQuery)
  );

  return (
    <div className="p-6 text-white">
      <Button
        onClick={() => router.back()}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Go Back
      </Button>
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient List</h1>
        <Link href="/patients/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Add New Patient
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by name, residence, or contact number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Patient Table */}
      <Table className="border border-gray-200">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Residence</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Next of Kin</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.map((patient) => (
            <TableRow key={patient.id} className="hover:bg-gray-50">
              <TableCell>{patient.first_name}</TableCell>
              <TableCell>{patient.last_name}</TableCell>
              <TableCell>
                {new Date(patient.dob).toLocaleDateString()}
              </TableCell>
              <TableCell>{patient.residence}</TableCell>
              <TableCell>{patient.contact_number}</TableCell>
              <TableCell>{patient.next_of_kin_name}</TableCell>
              <TableCell className="space-x-2">
                <Link href={`patients/${patient.id}`}>
                  <Button size="sm" className="bg-green-500">
                    View
                  </Button>
                </Link>
                <Link href={`department/patients/${patient.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(patient.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
