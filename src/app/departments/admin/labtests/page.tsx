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
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface LabTest {
  id?: number;
  service: string;
  cost: number;
  duration: string;
}

export default function LabTestManagement() {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLabTest, setCurrentLabTest] = useState<LabTest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { authState } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Number of items per page

  // Fetch all lab tests on page load
  const fetchLabTests = async () => {
    setIsLoading(true);
    try {
    
        	
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/labtests/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      const data = await response.json();
      setLabTests(data);
    
    
    
    } catch (error) {
      console.error("Failed to fetch lab tests:", error);
      toast.error("Failed to fetch lab tests.");
    } finally {
      setIsLoading(false);
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
  const handleSaveLabTest = async (labTest: LabTest) => {
    try {
      const url = currentLabTest
        ? `${process.env.NEXT_PUBLIC_API_URL}/labtests/${currentLabTest.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/labtests/`;
      const method = currentLabTest ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify(labTest),
      });

      if (response.ok) {
        toast.success(
          currentLabTest
            ? "Lab test updated successfully!"
            : "Lab test added successfully!"
        );
        fetchLabTests();
        setIsDialogOpen(false);
        setCurrentLabTest(null);
      } else {
        throw new Error("Failed to save lab test.");
      }
    } catch (error) {
      console.error("Failed to save lab test:", error);
      toast.error("Failed to save lab test.");
    }
  };

  // Handle deleting a lab test
  const handleDeleteLabTest = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/labtests/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Lab test deleted successfully!");
        fetchLabTests();
      } else {
        throw new Error("Failed to delete lab test.");
      }
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
            setUploadProgress(percentCompleted);
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
      setIsUploading(false);
      setUploadProgress(0);
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
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search lab tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
        <div className="space-x-2">
          <Button
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            Add Lab Test
          </Button>
          <Button
            className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-600 text-white dark:text-white"
            onClick={handlePrintLabTestList}
          >
            Print Lab Test List
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
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

      {/* Loading State */}
      {isLoading && <p className="text-center">Loading lab tests...</p>}

      {/* Lab Test Table */}
      {!isLoading && (
        <>
          <Table>
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
                  <TableCell>KSH {labTest.cost}</TableCell>
                  <TableCell>{labTest.duration}</TableCell>
                  <TableCell className="space-x-2">
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
                      className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-white"
                      onClick={() => handleDeleteLabTest(labTest.id!)}
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

      {/* Add/Edit Lab Test Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentLabTest ? "Edit Lab Test" : "Add Lab Test"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const labTest = {
                service: formData.get("service") as string,
                cost: parseFloat(formData.get("cost") as string),
                duration: formData.get("duration") as string,
              };
              handleSaveLabTest(labTest);
            }}
          >
            <Input
              className="mb-2"
              name="service"
              placeholder="Service Name"
              defaultValue={currentLabTest?.service}
              required
            />
            <Input
              className="mb-2"
              name="cost"
              type="number"
              placeholder="Cost"
              defaultValue={currentLabTest?.cost}
              required
            />
            <Input
              className="mb-2"
              name="duration"
              placeholder="Duration (e.g., 2 hours)"
              defaultValue={currentLabTest?.duration}
              required
            />
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
      <ToastContainer/>
    </div>
  );
}
