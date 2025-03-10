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
import LoadingPage from "@/components/loading_animation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";

type PhysicianNote = {
  note_id: number;
  visit: number;
  patient_name: string;
  triage_id?: number | null;
  diagnosis: string;
  disease: string;
  prescription: { [key: string]: string }[] | null;
  lab_tests_ordered: { [key: string]: string }[] | null;
  total_cost: number;
  physician: string | null;
  staff_name: string;
  recorded_at: string;
};

const PhysicianNotesTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [physicianNoteData, setPhysicianNoteData] = useState<PhysicianNote[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const itemsPerPage = 3;
  const { authState } = useAuth();

  useEffect(() => {
    async function fetchPatientsData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
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

  // Local filtering logic
  const filteredNotes = physicianNoteData.filter((note) => {
    const matchesSearch = note.patient_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDisease = note.disease
      .toLowerCase()
      .includes(diseaseFilter.toLowerCase());
    const matchesDateRange =
      (!startDate || new Date(note.recorded_at) >= startDate) &&
      (!endDate || new Date(note.recorded_at) <= endDate);

    return matchesSearch && matchesDisease && matchesDateRange;
  });

  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const displayedNotes = filteredNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleExpandRow = (noteId: number) => {
    setExpandedRows((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  return (
    <div className="p-6 rounded-lg shadow-md">
      {isLoading && <LoadingPage />}
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search by Patient name..."
          className="w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate || undefined} // Ensure `undefined` is passed instead of `null`
            placeholderText="Start Date"
            className="w-40 p-2 border rounded"
          />
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || undefined} // Ensure `undefined` is passed instead of `null`
            placeholderText="End Date"
            className="w-40 p-2 border rounded"
          />
        </div>
        <Input
          type="text"
          placeholder="Filter by Disease..."
          className="w-1/3"
          value={diseaseFilter}
          onChange={(e) => setDiseaseFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Disease</TableHead>
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
                    <TableCell>{note.patient_name}</TableCell>
                    <TableCell>{note.disease}</TableCell>
                    <TableCell>{note.staff_name || "Unknown"}</TableCell>
                    <TableCell>
                      Ksh {parseFloat(note.total_cost.toString()).toFixed(2)}
                    </TableCell>
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

                  {expandedRows.includes(note.note_id) && (
                    <TableRow key={`details-${note.note_id}`}>
                      <TableCell colSpan={7} className="p-4">
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium">Diagnosis:</span>{" "}
                            {note.diagnosis}
                          </div>
                          {note.prescription &&
                            note.prescription.length > 0 && (
                              <div>
                                <span className="font-medium">
                                  Prescription:
                                </span>
                                <ul className="list-disc list-inside ml-4">
                                  {note.prescription.map((item, index) => (
                                    <li key={index}>
                                      {item.drug_name}: {item.status} :{" "}
                                      {item.quantity} : {item.cost}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {note.lab_tests_ordered &&
                            note.lab_tests_ordered.length > 0 && (
                              <div>
                                <span className="font-medium">
                                  Lab Tests Ordered:
                                </span>
                                <ul className="list-disc list-inside ml-4">
                                  {note.lab_tests_ordered.map((test, index) => (
                                    <li key={index}>
                                      {test.service} : {test.duration} :{" "}
                                      {test.cost}
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
                <TableCell colSpan={7} className="text-center">
                  No physician notes found
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
            {filteredNotes.length})
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
