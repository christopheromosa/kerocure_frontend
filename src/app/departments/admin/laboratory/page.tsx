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
import LoadingPage from "@/components/loading_animation";

// Example data structure for Lab Results
interface LabResult {
  result_id: number;
  visit_id: number;
  note_id: number;
  result: Record<string, any>; // JSON data
  total_cost: number;
  recorded_by: string | null;
  recorded_at: string;
}

export default function LabResultsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;
  const [labResultsData, setLabResultsData] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPatientsData() {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8000/lab/");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setLabResultsData(data);
      } catch (err) {
        alert("Failed to load lab records");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatientsData();
  }, []);

console.log(labResultsData);
  // Pagination logic
  const totalPages = Math.ceil(labResultsData.length / resultsPerPage);
  const displayedResults = labResultsData.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div className="p-6  shadow-md rounded-lg">
      {isLoading && <LoadingPage />}
      <h2 className="text-xl font-semibold mb-4">Lab Results</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Visit ID</TableHead>
            <TableHead className="w-1/6">Physician Note</TableHead>
            <TableHead className="w-1/3">Results</TableHead>
            <TableHead className="w-1/6">Total Cost</TableHead>
            <TableHead className="w-1/6">Recorded By</TableHead>
            <TableHead className="w-1/6">Recorded At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedResults.map((result) => (
            <TableRow key={result.result_id}>
              <TableCell>{result.visit}</TableCell>
              <TableCell>{result.note}</TableCell>
              <TableCell>
                <pre className="text-xs  p-2 rounded flex flex-wrap gap-2 ">
 {Array.isArray(result.result)
      ? result.result.map((item, index) =>
          Object.entries(item).map(([key, value]) => (
            <div
              key={`${key}-${index}`}
              className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-600"
            >
              <span className="font-semibold">{key}:</span> {value.toString()}
            </div>
          ))
        )
      : Object.entries(result.result).map(([key, value]) => (
          <div
            key={key}
            className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-600"
          >
            <span className="font-semibold">{key}:</span> {value.toString()}
          </div>
        ))}
                </pre>
              </TableCell>
              <TableCell>Ksh {parseFloat(result.total_cost).toFixed(2)}</TableCell>
              <TableCell>{result.recorded_by ?? "N/A"}</TableCell>
              <TableCell>
                {new Date(result.recorded_at).toLocaleString()}
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
