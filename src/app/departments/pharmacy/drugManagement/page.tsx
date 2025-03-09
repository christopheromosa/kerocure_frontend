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
import { toast } from "react-toastify";
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

  // Filter drugs based on search query
  const filteredDrugs = drugs.filter((drug) =>
    drug.drug_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      toast.error("Failed to upload file.");
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
        <CardTitle>Drug Management</CardTitle>
      </CardHeader>
      <CardContent>
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

        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/3"
          />
          <Button onClick={() => setIsDialogOpen(true)}>Add Drug</Button>
        </div>

        {/* Loading State */}
        {isLoading && <p className="text-center">Loading drugs...</p>}

        {/* Drug List */}
        {!isLoading && (
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
              {filteredDrugs.map((drug) => (
                <TableRow key={drug.id}>
                  <TableCell>{drug.drug_name}</TableCell>
                  <TableCell>Ksh {drug.cost}</TableCell>
                  <TableCell>{drug.quantity}</TableCell>
                  <TableCell>{drug.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCurrentDrug(drug);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
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
              <Button variant="destructive" onClick={handleDeleteDrug}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
