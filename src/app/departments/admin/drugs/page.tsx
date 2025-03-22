"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface Drug {
  id?: number;
  drug_name: string;
  cost: number;
  quantity: number;
  status: string;
}

export default function DrugManagement() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDrug, setCurrentDrug] = useState<Drug | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUpdateStockDialogOpen, setIsUpdateStockDialogOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [updateStockSearchQuery, setUpdateStockSearchQuery] = useState("");
  const [filteredUpdateStockDrugs, setFilteredUpdateStockDrugs] = useState<
    Drug[]
  >([]);
  const { authState } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Function to handle drug selection
  const handleDrugSelection = (drug: Drug) => {
    setSelectedDrug(drug);
    setTotalQuantity(drug.quantity);
  };

  // Function to calculate total quantity
  const calculateTotalQuantity = (quantity: number) => {
    if (selectedDrug) {
      setTotalQuantity(selectedDrug.quantity + quantity);
    }
  };

  // Function to update drug stock
  const handleUpdateStock = async () => {
    if (selectedDrug) {
      const updatedDrug = { ...selectedDrug, quantity: totalQuantity };
      await handleUpdateStockDrug(updatedDrug);
      setIsUpdateStockDialogOpen(false);
      setSelectedDrug(null);
      setNewQuantity(0);
      setTotalQuantity(0);
    }
  };

  // Fetch all drugs on page load
  const fetchDrugs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      const data = await response.json();
      setDrugs(data);
    } catch (error) {
      console.error("Failed to fetch drugs:", error);
      toast.error("Failed to fetch drugs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  // Filter drugs based on search query
  const filteredDrugs = drugs.filter((drug) => {
    const matchesSearch = drug.drug_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || drug.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter drugs for the Update Stock dialog
  useEffect(() => {
    if (updateStockSearchQuery.trim() === "") {
      setFilteredUpdateStockDrugs([]); // Empty list when search query is empty
    } else {
      const filtered = drugs.filter((drug) =>
        drug.drug_name
          .toLowerCase()
          .includes(updateStockSearchQuery.toLowerCase())
      );
      setFilteredUpdateStockDrugs(filtered);
    }
  }, [updateStockSearchQuery, drugs]);

  // Paginate results
  const totalPages = Math.ceil(filteredDrugs.length / itemsPerPage);
  const displayedDrugs = filteredDrugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle adding or editing a drug
  const handleSaveDrug = async (drug: Drug) => {
    try {
      const url = currentDrug?.id
        ? `${process.env.NEXT_PUBLIC_API_URL}/drugs/${currentDrug.id}/` // Update existing drug
        : `${process.env.NEXT_PUBLIC_API_URL}/drugs/`; // Create new drug
      const method = currentDrug?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify(drug),
      });

      if (response.ok) {
        toast.success(
          currentDrug?.id
            ? "Drug updated successfully!"
            : "Drug added successfully!"
        );
        fetchDrugs();
        setIsDialogOpen(false);
        setCurrentDrug(null);
      } else {
        throw new Error("Failed to save drug.");
      }
    } catch (error) {
      console.error("Failed to save drug:", error);
      toast.error("Failed to save drug.");
    }
  };

  // Handle updating drug stock
  const handleUpdateStockDrug = async (drug: Drug) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/${drug.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify(drug),
        }
      );

      if (response.ok) {
        toast.success("Drug stock updated successfully!");
        fetchDrugs();
      } else {
        throw new Error("Failed to update drug stock.");
      }
    } catch (error) {
      console.error("Failed to update drug stock:", error);
      toast.error("Failed to update drug stock.");
    }
  };

  // Handle deleting a drug
  const handleDeleteDrug = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Drug deleted successfully!");
        fetchDrugs();
      } else {
        throw new Error("Failed to delete drug.");
      }
    } catch (error) {
      console.error("Failed to delete drug:", error);
      toast.error("Failed to delete drug.");
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-drug-stock/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${authState?.token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      toast.success("File uploaded successfully!");
      fetchDrugs();
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error("Failed to upload file.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle printing the drug list
  const handlePrintDrugList = () => {
    const printContent = `
      <html>
        <head>
          <title>Drug List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .header img {
              width: 100px;
              height: auto;
              margin-bottom: 7px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            .header p {
              margin: 5px 0;
              font-size: 14px;
              color: #666;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .table th, .table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <img src="/kerocureLogo-removebg-preview.png" alt="Organization Logo" />
              <h1>KEROCURE MEDICAL CENTER</h1>
              <p>PO BOX: 3192, KISII</p>
              <p>Email: Kerocure1@gmail.com | Tel: +254 725 808 100</p>
            </div>

            <!-- Drug Table -->
            <table class="table">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Cost</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredDrugs
                  .map(
                    (drug) => `
                  <tr>
                    <td>{drug.drug_name}</td>
                    <td>KSH ${drug.cost}</td>
                    <td>{drug.quantity}</td>
                    <td>{drug.status}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <!-- Footer -->
            <div class="footer">
              <p>Thank you for choosing KEROCURE MEDICAL CENTER!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search drugs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All</option>
          <option value="Available">Available</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        <div className="space-x-2">
          <Button
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            Add Drug
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
            onClick={() => setIsUpdateStockDialogOpen(true)}
          >
            Update Stock
          </Button>
          <Button
            className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-600 text-white dark:text-white"
            onClick={handlePrintDrugList}
          >
            Print Drug List
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mb-4">
        <label className="block font-semibold text-gray-700 mb-2">
          Upload Drug Stock File
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Please upload an Excel file with the following format:
            <br />
            <span className="font-bold">DRUG | COST | QUANTITY</span>
          </p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
          >
            <span>Choose File</span>
          </label>
          {isUploading && (
            <div className="mt-4 flex flex-col items-center">
              <CircularProgress
                variant="determinate"
                value={uploadProgress}
                size={60}
                thickness={5}
                className="text-blue-600"
              />
              <p className="mt-2 text-sm text-gray-600">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <p className="text-center">Loading drugs...</p>}

      {/* Drug Table */}
      {!isLoading && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug Name</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedDrugs.map((drug) => (
                <TableRow key={drug.id}>
                  <TableCell>{drug.drug_name}</TableCell>
                  <TableCell>KSH {drug.cost}</TableCell>
                  <TableCell>{drug.quantity}</TableCell>
                  <TableCell>{drug.status}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
                      onClick={() => {
                        setCurrentDrug(drug);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-white"
                      onClick={() => handleDeleteDrug(drug.id!)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
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
          )}
        </>
      )}

      {/* Update Stock Dialog */}
      <Dialog
        open={isUpdateStockDialogOpen}
        onOpenChange={setIsUpdateStockDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Drug Stock</DialogTitle>
          </DialogHeader>
          <div className="p-2 mb-2">
            <Input
              placeholder="Search drugs..."
              value={updateStockSearchQuery}
              onChange={(e) => setUpdateStockSearchQuery(e.target.value)}
              className="w-full mb-4"
            />
            {filteredUpdateStockDrugs.length > 0 ? (
              filteredUpdateStockDrugs.map((drug) => (
                <div
                  key={drug.id}
                  onClick={() => handleDrugSelection(drug)}
                  className="cursor-pointer hover:bg-gray-500 p-2 rounded"
                >
                  {drug.drug_name}
                </div>
              ))
            ) : (
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  setIsUpdateStockDialogOpen(false); // Close the Update Stock dialog
                  setIsDialogOpen(true); // Open the Add Drug dialog
                }}
              >
                Add New Drug
              </Button>
            )}
            {selectedDrug && (
              <div className="mt-4">
                <p>Drug Name: {selectedDrug.drug_name}</p>
                <p>Current Quantity: {selectedDrug.quantity}</p>
                <p>Status: {selectedDrug.status}</p>
                <Input
                  type="number"
                  placeholder="Add Quantity"
                  value={newQuantity}
                  onChange={(e) => {
                    setNewQuantity(Number(e.target.value));
                    calculateTotalQuantity(Number(e.target.value));
                  }}
                  className="w-full mb-2"
                />
                <p>Total Quantity: {totalQuantity}</p>
                <Button onClick={handleUpdateStock} className="w-full">
                  Complete
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Drug Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentDrug ? "Edit Drug" : "Add Drug"}</DialogTitle>
          </DialogHeader>
          <form
            className="p-2 mb-2"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const drug = {
                drug_name: formData.get("drug_name") as string,
                cost: parseFloat(formData.get("cost") as string),
                quantity: parseInt(formData.get("quantity") as string),
                status: formData.get("status") as string,
              };
              handleSaveDrug(drug);
            }}
          >
            <Input
              className="p-2 mb-2"
              name="drug_name"
              placeholder="Drug Name"
              defaultValue={currentDrug?.drug_name}
              required
            />
            <Input
              className="p-2 mb-2"
              name="cost"
              type="number"
              placeholder="Cost"
              defaultValue={currentDrug?.cost}
              required
            />
            <Input
              className="p-2 mb-2"
              name="quantity"
              type="number"
              placeholder="Quantity"
              defaultValue={currentDrug?.quantity}
              required
            />
            <select
              name="status"
              defaultValue={currentDrug?.status}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}
