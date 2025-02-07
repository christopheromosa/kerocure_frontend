"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import LoadingPage from "@/components/loading_animation";

// Example data structure for Billing records
interface Billing {
  bill_id: number;
  visit_id: number;
  consultation_cost: number;
  laboratory_cost: number;
  pharmacy_cost: number;
  total_cost: number;
  billed_by: string | null;
  recorded_at: string;
}



export default function BillingTable() {
  const [currentPage, setCurrentPage] = useState(1);
     const [billingData, setBillingData] = useState<Billing[]>([]);
     const [isLoading, setIsLoading] = useState(false);
  const resultsPerPage = 5;



    useEffect(() => {
      async function fetchBillingData() {
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/`);
          if (!response.ok) throw new Error("Failed to fetch data");

          const data = await response.json();
          setBillingData(data);
        } catch (err) {
          alert("Failed to load billing records");
        } finally {
          setIsLoading(false);
        }
      }
      fetchBillingData();
    }, []);

  // Pagination logic
  const totalPages = Math.ceil(billingData.length / resultsPerPage);
  const displayedBills = billingData.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div className="p-6  shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Billing Records</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Visit ID</TableHead>
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
              <TableCell>{bill.visit}</TableCell>
              <TableCell>Ksh {parseFloat(bill.consultation_cost).toFixed(2)}</TableCell>
              <TableCell>Ksh {parseFloat(bill.laboratory_cost).toFixed(2)}</TableCell>
              <TableCell>Ksh {parseFloat(bill.pharmacy_cost).toFixed(2)}</TableCell>
              <TableCell className="font-bold text-green-600">Ksh {parseFloat(bill.total_cost).toFixed(2)}</TableCell>
              <TableCell>{bill.billed_by ?? "N/A"}</TableCell>
              <TableCell>{new Date(bill.recorded_at).toLocaleString()}</TableCell>
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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
