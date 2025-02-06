"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import LoadingPage from "@/components/loading_animation";

type PhysicianNote = {
  note_id: number;
  visit: number;
  triage_id?: number | null;
  diagnosis: string;
  prescription: { [key: string]: string } | null;
  lab_tests_ordered: string[] | null;
  total_cost: number;
  physician: string | null;
  recorded_at: string;
};

const PhysicianNotesTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [physicianNoteData, setPhysicianNoteData] = useState<PhysicianNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 3;

  console.log(physicianNoteData);

  useEffect(() => {
    async function fetchPatientsData() {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8000/consultation/");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setPhysicianNoteData(data);
      } catch (err) {
        alert("Failed to load consultation records");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatientsData();
  }, []);

  // Filter records by Visit ID
  const filteredNotes = physicianNoteData.filter((note) =>
    note.visit.toString().includes(search)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const displayedNotes = filteredNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle expand/collapse for rows
  const toggleExpandRow = (noteId: number) => {
    setExpandedRows((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
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
              <TableHead className="w-1/6">Note ID</TableHead>
              <TableHead>Visit ID</TableHead>
              <TableHead>Physician</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Recorded At</TableHead>
              <TableHead className="w-1/12 text-center">Expand</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedNotes.length > 0 ? (
              displayedNotes.map((note) => (
                <React.Fragment key={note.note_id}>
                  <TableRow>
                    <TableCell>{note.note_id}</TableCell>
                    <TableCell>{note.visit}</TableCell>
                    <TableCell>{note.physician || "Unknown"}</TableCell>
                    <TableCell>Ksh {parseFloat(note.total_cost).toFixed(2)}</TableCell>
                    <TableCell>{note.recorded_at}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => toggleExpandRow(note.note_id)}
                      >
                        {expandedRows.includes(note.note_id) ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Row */}
                  {expandedRows.includes(note.note_id) && (
                    <TableRow key={`details-${note.note_id}`}>
                      <TableCell colSpan={6} className="p-4">
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium">Diagnosis:</span>{" "}
                            {note.diagnosis}
                          </div>
                          {note.prescription && note.prescription.length > 0 && (
                            <div>
                              <span className="font-medium">Prescription:</span>
                              <ul className="list-disc list-inside ml-4">
                                {note.prescription.map((item, index) => (
                                  <li key={index}>
                                    {item.medication}: {item.dosage}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
 
                         {note.lab_tests_ordered && note.lab_tests_ordered.length > 0 && (
                           <div>
                             <span className="font-medium">Lab Tests Ordered:</span>
                             <ul className="list-disc list-inside ml-4">
                               {note.lab_tests_ordered.map((test, index) => (
                                 <li key={index}>
                                   {test.test_name} {/* Accessing the test_name property */}
                                 </li>
                               ))}
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
                <TableCell colSpan={6} className="text-center">
                  No physician notes found
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
            Prev
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
      )}
    </div>
  );
};

export default PhysicianNotesTable;
