"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "@/components/loading_animation";

// Example data structure for Billing records
interface Billing {
  bill_id: number;
  visit_id: number;
  patient_name: string;
  consultation_cost: number;
  laboratory_cost: number;
  pharmacy_cost: number;
  total_cost: number;
  billed_by: string | null;
  staff_name: string;
  recorded_at: string;
}

export default function BillingTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [billingData, setBillingData] = useState<Billing[]>([]);
  const [filteredData, setFilteredData] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const resultsPerPage = 5;
  const { authState } = useAuth();

  useEffect(() => {
    async function fetchBillingData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/billing/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setBillingData(data);
        setFilteredData(data); // Initialize filtered data with all records
      } catch (err) {
        alert("Failed to load billing records");
        console.error(err);
        
      } finally {
        setIsLoading(false);
      }
    }
    fetchBillingData();
  }, [authState?.token]);

  // Filter data based on date range and search query
  useEffect(() => {
    let filtered = billingData;

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter((bill) => {
        const recordedAt = new Date(bill.recorded_at);
        return recordedAt >= startDate && recordedAt <= endDate;
      });
    }

    // Filter by patient name
    if (searchQuery) {
      filtered = filtered.filter((bill) =>
        bill.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to the first page after filtering
  }, [startDate, endDate, searchQuery, billingData]);

  // Calculate total cost for all filtered records
  const formatedTotalCost = filteredData.reduce((sum, bill) => {
    // Ensure total_cost is a number
    const billTotal =
      typeof bill.total_cost === "string"
        ? parseFloat(bill.total_cost)
        : bill.total_cost;
    return sum + (isNaN(billTotal) ? 0 : billTotal); // Add billTotal to the sum, default to 0 if NaN
  }, 0);

  // Display total cost with 2 decimal places
  const totalCost = formatedTotalCost.toFixed(2);
  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / resultsPerPage);
  const displayedBills = filteredData.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div className="p-6 shadow-md rounded-lg">
      {isLoading && <LoadingPage />}
      <h2 className="text-xl font-semibold mb-4">Billing Records</h2>

      {/* Search and Date Range Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by patient name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3"
        />
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)} // Explicitly define the type
          placeholderText="Start Date"
          className="w-full md:w-1/3"
        />
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)} // Explicitly define the type
          placeholderText="End Date"
          className="w-full md:w-1/3"
        />
      </div>

      {/* Total Cost Display for All Filtered Records */}
      <div className="mb-4">
        <strong>Total Cost for All Records:</strong> Ksh{" "}
        {parseFloat(totalCost.toString()).toFixed(2)}
      </div>

      {/* Billing Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Patient Name</TableHead>
            <TableHead className="w-1/6">Consultation Cost</TableHead>
            <TableHead className="w-1/6">Lab Cost</TableHead>
            <TableHead className="w-1/6">Pharmacy Cost</TableHead>
            <TableHead className="w-1/6">Total Cost</TableHead>
            <TableHead className="w-1/6">Billed By</TableHead>
            <TableHead className="w-1/6">Recorded At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedBills.map((bill) => (
            <TableRow key={bill.bill_id}>
              <TableCell>{bill.patient_name}</TableCell>
              <TableCell>
                Ksh {parseFloat(bill.consultation_cost.toString()).toFixed(2)}
              </TableCell>
              <TableCell>
                Ksh {parseFloat(bill.laboratory_cost.toString()).toFixed(2)}
              </TableCell>
              <TableCell>
                Ksh {parseFloat(bill.pharmacy_cost.toString()).toFixed(2)}
              </TableCell>
              <TableCell className="font-bold text-green-600">
                Ksh {parseFloat(bill.total_cost.toString()).toFixed(2)}
              </TableCell>
              <TableCell>{bill.staff_name ?? "N/A"}</TableCell>
              <TableCell>
                {new Date(bill.recorded_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
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
          Next
        </Button>
      </div>
    </div>
  );
}
