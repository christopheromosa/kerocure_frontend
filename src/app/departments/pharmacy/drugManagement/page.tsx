"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DrugForm } from "@/components/forms/drug-form";
import { CircularProgress } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

export default function DrugManagement() {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDrug, setCurrentDrug] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [drugToDelete, setDrugToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { authState } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  // Fetch drugs from the backend
  const fetchDrugs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      setDrugs(response.data);
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
  const filteredDrugs = drugs.filter((drug) =>
    drug.drug_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate results
  const totalPages = Math.ceil(filteredDrugs.length / itemsPerPage);
  const displayedDrugs = filteredDrugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle adding or editing a drug
  const handleSaveDrug = async (drug: any) => {
    try {
      if (currentDrug) {
        // Edit existing drug
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/drugs/${currentDrug.id}/`,
          drug,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Drug updated successfully!");
      } else {
        // Add new drug
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/drugs/`, drug, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        });
        toast.success("Drug added successfully!");
      }
      fetchDrugs(); // Refresh the list
      setIsDialogOpen(false);
      setCurrentDrug(null);
    } catch (error) {
      console.error("Failed to save drug:", error);
      toast.error("Failed to save drug.");
    }
  };

  // Handle deleting a drug
  const handleDeleteDrug = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/${drugToDelete.id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      toast.success("Drug deleted successfully!");
      fetchDrugs(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setDrugToDelete(null);
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

            // Gradually increase the progress bar
            const increaseProgress = (target: number) => {
              setTimeout(() => {
                setUploadProgress((prev) => {
                  if (prev < target) {
                    increaseProgress(target); // Continue increasing
                    return prev + 1; // Increment by 1%
                  }
                  return target; // Stop when target is reached
                });
              }, 50); // Adjust speed (50ms per step)
            };

            increaseProgress(percentCompleted);
          },
        }
      );

      toast.success("File uploaded successfully!");
      fetchDrugs();
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error("Failed to upload file check format");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
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
              max-width: 800px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .header img {
              width: 100px;
              height: auto;
              margin-bottom: 10px;
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
                    <td>${drug.drug_name}</td>
                    <td>KSH ${drug.cost}</td>
                    <td>${drug.quantity}</td>
                    <td>${drug.status}</td>
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
    <Card>
      <CardHeader>
        <CardTitle>Drug Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Print Section */}
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/3"
          />
          <Button
            className="bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-white"
            onClick={handlePrintDrugList}
          >
            Print Drug List
          </Button>
        </div>

        {/* Add File Upload Input */}
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

        {/* Add Drug Button */}
        <Button onClick={() => setIsDialogOpen(true)}>Add Drug</Button>

        {/* Loading State */}
        {isLoading && <p className="text-center">Loading drugs...</p>}

        {/* Drug List */}
        {!isLoading && (
          <>
            <Table className="mt-4">
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
                    <TableCell>Ksh {drug.cost}</TableCell>
                    <TableCell>{drug.quantity}</TableCell>
                    <TableCell>{drug.status}</TableCell>
                    <TableCell>
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
                        variant="destructive"
                        className="ml-2 bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-white"
                        onClick={() => {
                          setDrugToDelete(drug);
                          setIsDeleteDialogOpen(true);
                        }}
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

        {/* Add/Edit Drug Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentDrug ? "Edit Drug" : "Add Drug"}
              </DialogTitle>
            </DialogHeader>
            <DrugForm
              drug={currentDrug}
              onSubmit={handleSaveDrug}
              onCancel={() => {
                setIsDialogOpen(false);
                setCurrentDrug(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this drug?</p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-white"
                onClick={handleDeleteDrug}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ToastContainer/>
      </CardContent>
    </Card>
  );
}
