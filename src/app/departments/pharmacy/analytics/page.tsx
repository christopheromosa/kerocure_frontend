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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingPage from "@/components/loading_animation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import dayjs from "dayjs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interfaces for our data types
interface Medication {
  medication_id: number;
  visit_id: number;
  patient_name: string;
  note_id: number;
  prescriptions: Record<string, any> | null;
  cost: number;
  dispensed_by: string | null;
  staff_name: string;
  dispensed_at: string;
}

interface DrugSale {
  id: number;
  drug_name: string;
  quantity_sold: number;
  total_amount: string;
  date: string;
}

export default function CombinedMedicationsTable() {
  const [viewMode, setViewMode] = useState<"medications" | "drugSales">(
    "medications"
  );
  const [medicationsData, setMedicationsData] = useState<Medication[]>([]);
  const [drugSalesData, setDrugSalesData] = useState<DrugSale[]>([]);
  const [filteredSales, setFilteredSales] = useState<DrugSale[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { authState } = useAuth();

  // Fetch data based on view mode
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (viewMode === "medications") {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/pharmacy/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${authState?.token}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch medication data");
          setMedicationsData(await response.json());
        } else {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/drug-sales/list/`,
            {
              headers: {
                Authorization: `Token ${authState?.token}`,
              },
            }
          );
          setDrugSalesData(response.data);
          setFilteredSales(response.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        alert(`Failed to load ${viewMode} records`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [viewMode, authState?.token]);

  // Filter drug sales based on search term and date range
  useEffect(() => {
    if (viewMode === "drugSales") {
      let filtered = drugSalesData;

      if (searchTerm) {
        filtered = filtered.filter((sale) =>
          sale.drug_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (startDate && endDate) {
        filtered = filtered.filter((sale) => {
          const saleDate = dayjs(sale.date);
          return (
            saleDate.isAfter(dayjs(startDate)) &&
            saleDate.isBefore(dayjs(endDate).add(1, "day"))
          );
        });
      }

      setFilteredSales(filtered);
      setCurrentPage(1); // Reset to first page after filtering
    }
  }, [searchTerm, startDate, endDate, drugSalesData, viewMode]);

  // Toggle expand/collapse for prescriptions
  const toggleExpandRow = (medicationId: number) => {
    setExpandedRows((prev) =>
      prev.includes(medicationId)
        ? prev.filter((id) => id !== medicationId)
        : [...prev, medicationId]
    );
  };

  // Calculate totals
  const totalSalesAmount = filteredSales.reduce((sum, sale) => {
    return sum + parseFloat(sale.total_amount);
  }, 0);

  // Pagination logic
  const totalPages = {
    medications: Math.ceil(medicationsData.length / itemsPerPage),
    drugSales: Math.ceil(filteredSales.length / itemsPerPage),
  };

  const currentItems = {
    medications: medicationsData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    drugSales: filteredSales.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
  };
  console.log(currentItems);

  return (
    <div className="p-6 shadow-md rounded-lg">
      {isLoading && <LoadingPage />}

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {viewMode === "medications" ? "Medications" : "Drug Sales"}
        </h2>
        <Tabs
          value={viewMode}
          onValueChange={(value) => {
            setViewMode(value as "medications" | "drugSales");
            setCurrentPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="drugSales">Drug Sales</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters (only for drug sales view) */}
      {viewMode === "drugSales" && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search by drug name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3"
          />
          <Input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full md:w-1/4"
          />
          <Input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full md:w-1/4"
          />
        </div>
      )}

      {/* Total Amount (for drug sales) */}
      {viewMode === "drugSales" && (
        <div className="mb-6">
          <p className="text-lg font-semibold">
            Total Amount:{" "}
            <span className="text-blue-600">
              Ksh {totalSalesAmount.toFixed(2)}
            </span>
          </p>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {viewMode === "medications" ? (
              <>
                <TableHead className="w-1/6">Patient Name</TableHead>
                <TableHead className="w-1/6">Prescriptions</TableHead>
                <TableHead className="w-1/6">Cost</TableHead>
                <TableHead className="w-1/6">Dispensed By</TableHead>
                <TableHead className="w-1/6">Dispensed At</TableHead>
              </>
            ) : (
              <>
                <TableHead>Drug Name</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Date</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {viewMode === "medications"
            ? currentItems.medications.map((medication) => (
                <React.Fragment key={medication.medication_id}>
                  <TableRow>
                    <TableCell>{medication.patient_name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          toggleExpandRow(medication.medication_id)
                        }
                      >
                        {expandedRows.includes(medication.medication_id)
                          ? "Close"
                          : "View"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      Ksh {parseFloat(medication.cost.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell>{medication.staff_name ?? "N/A"}</TableCell>
                    <TableCell>
                      {new Date(medication.dispensed_at).toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* Expandable Row for Prescriptions */}
                  {expandedRows.includes(medication.medication_id) &&
                    medication.prescriptions && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-4">
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
                                      {prescription.drug_name}
                                    </p>
                                    <p>
                                      <strong> Total Cost:</strong> Ksh{" "}
                                      {prescription.cost}
                                    </p>
                                    <p>
                                      <strong>Prescribed Quantity:</strong>{" "}
                                      {prescription.prescribed_quantity}
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
              ))
            : currentItems.drugSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.drug_name}</TableCell>
                  <TableCell>{sale.quantity_sold}</TableCell>
                  <TableCell>Ksh {sale.total_amount}</TableCell>
                  <TableCell>
                    {dayjs(sale.date).format("MMM D, YYYY")}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <div>
          {viewMode === "drugSales" && (
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages[viewMode]}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages[viewMode]}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages[viewMode]))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
