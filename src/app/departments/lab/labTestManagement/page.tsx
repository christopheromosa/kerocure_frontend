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

export default function LabTestManagement() {
  const [labTests, setLabTests] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLabTest, setCurrentLabTest] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [labTestToDelete, setLabTestToDelete] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { authState } = useAuth();

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

  // Handle adding or editing a lab test
  const handleSaveLabTest = async (labTest: any) => {
    try {
      if (currentLabTest) {
        // Edit existing lab test
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/labtests/${currentLabTest.id}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
            labTest,
          }
        );
        toast.success("Lab test updated successfully!");
      } else {
        // Add new lab test
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/labtests/`,
           {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
            labTest
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Test Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add File Upload Input */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-2">
            Upload Laboratory price list File
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
            {labTests.map((labTest) => (
              <TableRow key={labTest.id}>
                <TableCell>{labTest.service}</TableCell>
                <TableCell>Ksh {labTest.cost}</TableCell>
                <TableCell>{labTest.duration}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentLabTest(labTest);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
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
              <Button variant="destructive" onClick={handleDeleteLabTest}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
