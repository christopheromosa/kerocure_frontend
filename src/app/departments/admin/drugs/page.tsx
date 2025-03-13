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
import { toast } from "react-toastify";
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
  const { authState } = useAuth();

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
  const filteredDrugs = drugs.filter((drug) =>
    drug.drug_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding or editing a drug
  const handleSaveDrug = async (drug: Drug) => {
    try {
      const url = currentDrug
        ? `${process.env.NEXT_PUBLIC_API_URL}/drugs/${currentDrug.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/drugs/`;
      const method = currentDrug ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(drug),
      });

      if (response.ok) {
        toast.success(
          currentDrug
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

  // Handle deleting a drug
  const handleDeleteDrug = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/${id}/`,
        {
          method: "DELETE",
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
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search drugs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          Add Drug
        </Button>
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
                <TableCell>KSH {drug.cost}</TableCell>
                <TableCell>{drug.quantity}</TableCell>
                <TableCell>{drug.status}</TableCell>
                <TableCell>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => {
                      setCurrentDrug(drug);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => handleDeleteDrug(drug.id!)}
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
    </div>
  );
}
