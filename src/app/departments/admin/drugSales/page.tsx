"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import dayjs from "dayjs";

interface DrugSale {
  id: number;
  drug_name: string;
  quantity_sold: number;
  total_amount: string;
  date: string;
}

export default function DrugSales() {
  const [drugSales, setDrugSales] = useState<DrugSale[]>([]);
  const [filteredSales, setFilteredSales] = useState<DrugSale[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch all drug sales on component mount
  useEffect(() => {
    const fetchDrugSales = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/drug-sales/list/`
        );
        setDrugSales(response.data);
        setFilteredSales(response.data);
      } catch (error) {
        console.error("Error fetching drug sales:", error);
      }
    };
    fetchDrugSales();
  }, []);

  // Filter drug sales based on search term and date range
  useEffect(() => {
    let filtered = drugSales;

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
  }, [searchTerm, startDate, endDate, drugSales]);

  // Calculate total amount of filtered sales
  const totalAmount = filteredSales.reduce((sum, sale) => {
    // Convert sale.total_amount to a number (or Decimal) before adding
    const amount = parseFloat(sale.total_amount); // or use Number(sale.total_amount)
    return sum + amount;
  }, 0);

  // Format the total amount as a currency value
  const formattedTotalAmount = `Ksh ${totalAmount.toFixed(2)}`;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Drug Sales</h1>

      {/* Search and Date Filters */}
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

      {/* Total Amount */}
      <div className="mb-6">
        <p className="text-lg font-semibold">
          Total Amount:{" "}
          <span className="text-blue-600">{formattedTotalAmount}</span>
        </p>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Drug Name</TableHead>
            <TableHead>Quantity Sold</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.drug_name}</TableCell>
              <TableCell>{sale.quantity_sold}</TableCell>
              <TableCell>Ksh {sale.total_amount}</TableCell>
              <TableCell>{dayjs(sale.date).format("MMM D, YYYY")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          {Array.from(
            { length: Math.ceil(filteredSales.length / itemsPerPage) },
            (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
