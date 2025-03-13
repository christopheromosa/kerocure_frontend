"use client";
import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadingPage from "@/components/loading_animation";
import OrganizationInfo from "@/components/OrganizationInfo";
import { useAuth } from "@/context/AuthContext";

type Visit = {
  visit_id: number;
  visit_date: string;
  visit_type: string;
  department: string;
  visit_status: string;
  patient_name: string;
  patient_id: number;
  total_cost: number;
  triage: any;
  consultation: any[];
  lab: any[];
  pharmacy: any[];
  billing: any[];
};

const VisitsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visitsData, setVisitsData] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 5;
  const { authState } = useAuth();

  useEffect(() => {
    async function fetchVisitsData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/all-visits/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setVisitsData(data);
      } catch (err) {
        alert("Failed to load visit records");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVisitsData();
  }, [authState?.token]);

  // Filter visits based on search criteria
  const filteredVisits = visitsData.filter((visit) => {
    const patientName = visit.patient_name || ""; // Default to empty string if null/undefined
    const department = visit.department || ""; // Default to empty string if null/undefined
    const visitStatus = visit.visit_status || ""; // Default to empty string if null/undefined

    const matchesSearch = patientName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDepartment = department
      .toLowerCase()
      .includes(departmentFilter.toLowerCase());
    const matchesStatus = visitStatus
      .toLowerCase()
      .includes(statusFilter.toLowerCase());
    const matchesDateRange =
      (!startDate ||
        new Date(visit.visit_date).setHours(0, 0, 0, 0) >=
          new Date(startDate).setHours(0, 0, 0, 0)) &&
      (!endDate ||
        new Date(visit.visit_date).setHours(0, 0, 0, 0) <=
          new Date(endDate).setHours(23, 59, 59, 999));

    return (
      matchesSearch && matchesDepartment && matchesStatus && matchesDateRange
    );
  });

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  const displayedVisits = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 rounded-lg shadow-md">
      {isLoading && <LoadingPage />}
      <div className="flex justify-between items-center mb-4 gap-4">
        <Input
          type="text"
          placeholder="Search by Patient name..."
          className="w-1/4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Filter by Department..."
          className="w-1/4"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Filter by Status..."
          className="w-1/4"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <div className="flex gap-2">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate || undefined}
            placeholderText="Start Date"
            className="w-40 p-2 border rounded"
          />
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || undefined}
            placeholderText="End Date"
            className="w-40 p-2 border rounded"
          />
        </div>
      </div>
      {/* Total Records Field */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          {/* Text */}
          <p className="text-sm text-gray-700">
            Total Records:{" "}
            <span className="font-semibold text-gray-900">
              {filteredVisits.length} Patients
            </span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Visit Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedVisits.length > 0 ? (
              displayedVisits.map((visit) => (
                <TableRow key={visit.visit_id}>
                  <TableCell>{visit.patient_name}</TableCell>
                  <TableCell>{visit.visit_date}</TableCell>
                  <TableCell>{visit.department}</TableCell>
                  <TableCell>{visit.visit_status}</TableCell>
                  <TableCell className="text-green-400">
                    Ksh {visit.billing[0]?.total_cost?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white"
                      onClick={() => handleViewDetails(visit)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No visits found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Prev
          </Button>
          <span>
            Page {currentPage} of {totalPages} (Total Records:{" "}
            {filteredVisits.length})
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-6 rounded-xl shadow-lg border border-gray-200 bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4 ">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              <OrganizationInfo />
            </DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-6 text-gray-700 border p-2">
              {/* Main Visit Details in Grid */}
              <div className="grid grid-cols-3 gap-4 text-sm border p-2">
                <div className="space-y-2">
                  <p className="font-medium">Visit ID:</p>
                  <p>{selectedVisit.visit_id}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Patient Name:</p>
                  <p>{selectedVisit.patient_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Visit Date:</p>
                  <p>{selectedVisit.visit_date}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Department:</p>
                  <p>{selectedVisit.department}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Status:</p>
                  <p>{selectedVisit.visit_status}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Total Cost:</p>
                  <p className="text-green-600 font-semibold">
                    Ksh{" "}
                    {selectedVisit.billing[0]?.total_cost?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Consultation Details */}
              {selectedVisit.consultation.length > 0 && (
                <div className="mt-4 border p-2">
                  <h3 className="font-semibold text-lg mb-2">Consultation</h3>
                  {selectedVisit.consultation.map((consultation, index) => (
                    <div key={index} className="space-y-2">
                      <p>
                        <strong>Diagnosis:</strong> {consultation.diagnosis}
                      </p>
                      <p>
                        <strong>Disease:</strong> {consultation.disease}
                      </p>
                      <p>
                        <strong>Prescription:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-4">
                        {consultation.prescription.map(
                          (prescription: any, idx: number) => (
                            <li key={idx}>
                              {prescription.drug_name} - {prescription.quantity}{" "}
                              units (Ksh {prescription.cost})
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Lab Details */}
              {selectedVisit.lab.length > 0 && (
                <div className="mt-4 border p-2">
                  <h3 className="font-semibold text-lg mb-2">Lab Tests</h3>
                  {selectedVisit.lab.map((lab, index) => (
                    <div key={index} className="space-y-2">
                      <p>
                        <strong>Result:</strong> {lab.result[0]?.result}
                      </p>
                      <p>
                        <strong>Cost:</strong> Ksh {lab.total_cost?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Pharmacy Details */}
              {selectedVisit.pharmacy.length > 0 && (
                <div className="mt-4 p-2 border">
                  <h3 className="font-semibold text-lg mb-2">Pharmacy</h3>
                  {selectedVisit.pharmacy.map((pharmacy, index) => (
                    <div key={index} className="space-y-2">
                      <p>
                        <strong>Medications:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-4">
                        {pharmacy.prescriptions.map(
                          (medication: any, idx: number) => (
                            <li key={idx}>
                              {medication.medication_name} -{" "}
                              {medication.quantity} units (Ksh {medication.cost}
                              )
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Billing Details */}
              {selectedVisit.billing.length > 0 && (
                <div className="mt-4 border p-2">
                  <h3 className="font-semibold text-lg mb-2">Billing</h3>
                  {selectedVisit.billing.map((bill, index) => (
                    <div key={index} className="space-y-2">
                      <p>
                        <strong>Consultation Cost:</strong> Ksh{" "}
                        {bill.consultation_cost?.toFixed(2)}
                      </p>
                      <p>
                        <strong>Lab Cost:</strong> Ksh{" "}
                        {bill.laboratory_cost?.toFixed(2)}
                      </p>
                      <p>
                        <strong>Pharmacy Cost:</strong> Ksh{" "}
                        {bill.pharmacy_cost?.toFixed(2)}
                      </p>
                      <p>
                        <strong>Total Cost:</strong> Ksh{" "}
                        {bill.total_cost?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitsTable;
