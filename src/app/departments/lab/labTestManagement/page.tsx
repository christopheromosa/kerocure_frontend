"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LabTestForm } from "@/components/forms/lab-test-form";
import { CircularProgress } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";

export default function LabTestManagement() {
  const [labTests, setLabTests] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLabTest, setCurrentLabTest] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [labTestToDelete, setLabTestToDelete] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { authState } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch lab tests from the backend
  const fetchLabTests = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/labtests/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      setLabTests(response.data);
    } catch (error) {
      console.error("Failed to fetch lab tests:", error);
      toast.error("Failed to fetch lab tests.");
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, []);

  // Filter lab tests based on search query
  const filteredLabTests = labTests.filter((labTest) =>
    labTest.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate results
  const totalPages = Math.ceil(filteredLabTests.length / itemsPerPage);
  const displayedLabTests = filteredLabTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle adding or editing a lab test
  const handleSaveLabTest = async (labTest: any) => {
    try {
      if (currentLabTest) {
        // Edit existing lab test
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/labtests/${currentLabTest.id}/`,
          labTest,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Lab test updated successfully!");
      } else {
        // Add new lab test
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/labtests/`,
          labTest,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Lab test added successfully!");
      }
      fetchLabTests(); // Refresh the list
      setIsDialogOpen(false);
      setCurrentLabTest(null);
    } catch (error) {
      console.error("Failed to save lab test:", error);
      toast.error("Failed to save lab test.");
    }
  };

  // Handle deleting a lab test
  const handleDeleteLabTest = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/labtests/${labTestToDelete.id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      toast.success("Lab test deleted successfully!");
      fetchLabTests(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setLabTestToDelete(null);
    } catch (error) {
      console.error("Failed to delete lab test:", error);
      toast.error("Failed to delete lab test.");
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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-lab-tests/`,
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

      toast.success(response.data.message);
      fetchLabTests(); // Refresh the lab test list
    } catch (error) {
      console.error("Failed to upload file:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.error || "Failed to upload file.");
      } else {
        toast.error("Failed to upload file.");
      }
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Handle printing the lab test list
  const handlePrintLabTestList = () => {
    const printContent = `
      <html>
        <head>
          <title>Lab Test List</title>
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

            <!-- Lab Test Table -->
            <table class="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Cost</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${filteredLabTests
                  .map(
                    (labTest) => `
                  <tr>
                    <td>${labTest.service}</td>
                    <td>KSH ${labTest.cost}</td>
                    <td>${labTest.duration}</td>
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
        <CardTitle>Lab Test Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Print Section */}
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search lab tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/3"
          />
          <Button
            className="bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-white"
            onClick={handlePrintLabTestList}
          >
            Print Lab Test List
          </Button>
        </div>

        {/* Add File Upload Input */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-2">
            Upload Laboratory Price List File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Please upload an Excel file with the following format:
              <br />
              <span className="font-bold">SERVICES | COST | DURATION</span>
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

        {/* Add Lab Test Button */}
        <Button onClick={() => setIsDialogOpen(true)}>Add Lab Test</Button>

        {/* Lab Test List */}
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedLabTests.map((labTest) => (
              <TableRow key={labTest.id}>
                <TableCell>{labTest.service}</TableCell>
                <TableCell>Ksh {labTest.cost}</TableCell>
                <TableCell>{labTest.duration}</TableCell>
                <TableCell>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
                    onClick={() => {
                      setCurrentLabTest(labTest);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:text-white"
                    onClick={() => {
                      setLabTestToDelete(labTest);
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

        {/* Add/Edit Lab Test Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentLabTest ? "Edit Lab Test" : "Add Lab Test"}
              </DialogTitle>
            </DialogHeader>
            <LabTestForm
              labTest={currentLabTest}
              onSubmit={handleSaveLabTest}
              onCancel={() => {
                setIsDialogOpen(false);
                setCurrentLabTest(null);
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
            <p>Are you sure you want to delete this lab test?</p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:text-white"
                onClick={handleDeleteLabTest}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
