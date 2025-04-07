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
import { ChevronDown, ChevronUp } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadingPage from "@/components/loading_animation";
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
  transfer_history: {
    from_department: string;
    to_department: string;
    reason: string;
    transferred_by: string;
    transferred_at: string;
  }[];
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
  const [visitTypeFilter, setVisitTypeFilter] = useState(""); // New state for visit type filter
  const [expandedRows, setExpandedRows] = useState<number[]>([]); // State for expanded rows
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
    const patientName = visit.patient_name || "";
    const department = visit.department || "";
    const visitStatus = visit.visit_status || "";
    const visitType = visit.visit_type || "";

    const matchesSearch = patientName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDepartment = department
      .toLowerCase()
      .includes(departmentFilter.toLowerCase());
    const matchesStatus = visitStatus
      .toLowerCase()
      .includes(statusFilter.toLowerCase());
    const matchesVisitType = visitType
      .toLowerCase()
      .includes(visitTypeFilter.toLowerCase());
    const matchesDateRange =
      (!startDate ||
        new Date(visit.visit_date).setHours(0, 0, 0, 0) >=
          new Date(startDate).setHours(0, 0, 0, 0)) &&
      (!endDate ||
        new Date(visit.visit_date).setHours(0, 0, 0, 0) <=
          new Date(endDate).setHours(23, 59, 59, 999));

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus &&
      matchesVisitType &&
      matchesDateRange
    );
  });

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  const displayedVisits = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleExpandRow = (visitId: number) => {
    setExpandedRows((prev) =>
      prev.includes(visitId)
        ? prev.filter((id) => id !== visitId)
        : [...prev, visitId]
    );
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
        <Input
          type="text"
          placeholder="Filter by Visit Type..."
          className="w-1/4"
          value={visitTypeFilter}
          onChange={(e) => setVisitTypeFilter(e.target.value)}
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

              <TableHead>Department</TableHead>
              <TableHead>Visit Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Visit Date</TableHead>
              <TableHead className="w-1/12 text-center">Transfers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedVisits.length > 0 ? (
              displayedVisits.map((visit) => (
                <React.Fragment key={visit.visit_id}>
                  <TableRow>
                    <TableCell>{visit.patient_name}</TableCell>

                    <TableCell>{visit.department}</TableCell>
                    <TableCell>{visit.visit_type}</TableCell>
                    <TableCell>{visit.visit_status}</TableCell>
                    <TableCell className="text-green-400">
                      Ksh {visit.billing[0]?.total_cost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>{visit.visit_date}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => toggleExpandRow(visit.visit_id)}
                      >
                        {expandedRows.includes(visit.visit_id) ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {expandedRows.includes(visit.visit_id) && (
                    <TableRow key={`details-${visit.visit_id}`}>
                      <TableCell colSpan={7} className="p-4">
                        <div className="space-y-3">
                          {/* Transfer History */}
                          {visit.transfer_history &&
                            visit.transfer_history.length > 0 && (
                              <div>
                                <span className="font-medium">
                                  Transfer History:
                                </span>
                                <ul className="list-disc list-inside ml-4">
                                  {visit.transfer_history.map(
                                    (transfer, idx) => (
                                      <li key={idx}>
                                        <strong>From:</strong>{" "}
                                        {transfer.from_department} |{" "}
                                        <strong>To:</strong>{" "}
                                        {transfer.to_department} |{" "}
                                        <strong>Reason:</strong>{" "}
                                        {transfer.reason} | <strong>By:</strong>{" "}
                                        {transfer.transferred_by} |{" "}
                                        <strong>At:</strong>{" "}
                                        {new Date(
                                          transfer.transferred_at
                                        ).toLocaleString([], {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
    </div>
  );
};

export default VisitsTable;
