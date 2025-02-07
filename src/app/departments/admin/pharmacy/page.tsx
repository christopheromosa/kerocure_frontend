"use client";

import React from "react";
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

// Example data structure for Medications
interface Medication {
  medication_id: number;
  visit_id: number;
  note_id: number;
  prescriptions: Record<string, any> | null;
  cost: number;
  dispensed_by: string | null;
  dispensed_at: string;
}

export default function MedicationsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [medicationsData, setMedicationsData] = useState<Medication[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const resultsPerPage = 5;

  useEffect(() => {
    async function fetchMedicationData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pharmacy/`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setMedicationsData(data);
      } catch (err) {
        alert("Failed to load pharmacy records");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMedicationData();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(medicationsData.length / resultsPerPage);
  const displayedMedications = medicationsData.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Toggle expand/collapse for prescriptions
  const toggleExpandRow = (medicationId: number) => {
    setExpandedRows((prev) =>
      prev.includes(medicationId)
        ? prev.filter((id) => id !== medicationId)
        : [...prev, medicationId]
    );
  };

  return (
    <div className="p-6 shadow-md rounded-lg">
      {isLoading && <LoadingPage />}
      <h2 className="text-xl font-semibold mb-4">Medications</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Visit ID</TableHead>
            <TableHead className="w-1/6">Physician Note</TableHead>
            <TableHead className="w-1/3">Prescriptions</TableHead>
            <TableHead className="w-1/6">Cost</TableHead>
            <TableHead className="w-1/6">Dispensed By</TableHead>
            <TableHead className="w-1/6">Dispensed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedMedications.map((medication) => (
            <React.Fragment key={medication.medication_id}>
              <TableRow>
                <TableCell>{medication.visit}</TableCell>
                <TableCell>{medication.note}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpandRow(medication.medication_id)}
                  >
                    {expandedRows.includes(medication.medication_id)
                      ? "Close"
                      : "View"}
                  </Button>
                </TableCell>
                <TableCell>
                  Ksh {parseFloat(medication.cost).toFixed(2)}
                </TableCell>
                <TableCell>{medication.dispensed_by ?? "N/A"}</TableCell>
                <TableCell>
                  {new Date(medication.dispensed_at).toLocaleString()}
                </TableCell>
              </TableRow>

              {/* Expandable Row for Prescriptions */}
              {expandedRows.includes(medication.medication_id) &&
                medication.prescriptions && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-4">
                      <div className="space-y-3">
                        <span className="font-medium">Prescriptions:</span>
                        <div className="space-y-2 flex gap-2">
                          {medication.prescriptions.map(
                            (prescription: any, index: number) => (
                              <div
                                key={index}
                                className="border rounded-md p-3"
                              >
                                <p>
                                  <strong>Medication Name:</strong>{" "}
                                  {prescription.medication_name}
                                </p>
                                <p>
                                  <strong>Cost:</strong> Ksh {prescription.cost}
                                </p>
                                <p>
                                  <strong>Quantity:</strong>{" "}
                                  {prescription.quantity}
                                </p>
                                <p>
                                  <strong>Dispensed:</strong>{" "}
                                  {prescription.dispensed ? "Yes" : "No"}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
            </React.Fragment>
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
