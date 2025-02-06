"use client";
import React from 'react';
import { useEffect, useState } from "react";
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
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import LoadingPage from "@/components/loading_animation";

type Triage = {
  triage_id: number;
  visit: number;
  vital_signs: { [key: string]: string | number };
  recorded_by: string | null;
  recorded_at: string;
};

const TriageTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [triageData, setTriageData] = useState<Triage[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 3;

  useEffect(() => {
    async function fetchTriageData() {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8000/triage/");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setTriageData(data);
      } catch (err) {
        alert("Failed to load triage records");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTriageData();
  }, []);

  // Filter triage records by Visit ID
  const filteredTriage = triageData?.filter((triage) =>
    triage.visit.toString().includes(search)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTriage.length / itemsPerPage);
  const displayedTriage = filteredTriage.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle expand/collapse for vital signs
  const toggleExpandRow = (triageId: number) => {
    setExpandedRows((prev) =>
      prev.includes(triageId) ? prev.filter((id) => id !== triageId) : [...prev, triageId]
    );
  };

  return (
    <div className="p-6 rounded-lg shadow-md">
      {isLoading && <LoadingPage />}
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search by Visit ID..."
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
              <TableHead className="w-1/6">Triage ID</TableHead>
              <TableHead>Visit ID</TableHead>
              <TableHead>Vital Signs</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Recorded At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTriage.length > 0 ? (
              displayedTriage.map((triage) => (
                <React.Fragment key={triage.triage_id}>
                  <TableRow>
                    <TableCell>{triage.triage_id}</TableCell>
                    <TableCell>{triage.visit}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() => toggleExpandRow(triage.triage_id)}
                      >
                        {expandedRows.includes(triage.triage_id) ? (
                          <Minus size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{triage.recorded_by || "Unknown"}</TableCell>
                    <TableCell>{triage.recorded_at}</TableCell>
                  </TableRow>

                  {/* Expanded Row for Vital Signs */}
                  {expandedRows.includes(triage.triage_id) && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-4">
                        <ul className="text-sm space-y-2">
                          {Object.entries(triage.vital_signs).map(
                            ([key, value]) => (
                              <li key={key}>
                                <span className="font-medium">{key}:</span> {value}
                              </li>
                            )
                          )}
                        </ul>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No triage records found
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
    </div>
  );
};

export default TriageTable;
