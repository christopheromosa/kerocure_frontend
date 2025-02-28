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

export default function DrugManagement(){
  const [drugs, setDrugs] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDrug, setCurrentDrug] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [drugToDelete, setDrugToDelete] = useState<any>(null);

  // Fetch drugs from the backend
  const fetchDrugs = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/`
      );
      setDrugs(response.data);
    } catch (error) {
      console.error("Failed to fetch drugs:", error);
      toast.error("Failed to fetch drugs.");
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
          drug
        );
        toast.success("Drug updated successfully!");
      } else {
        // Add new drug
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/drugs/`, drug);
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
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/${drugToDelete.id}/`
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drug Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setIsDialogOpen(true)}>Add Drug</Button>

        {/* Drug List */}
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Drug Name</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drugs.map((drug) => (
              <TableRow key={drug.id}>
                <TableCell>{drug.drug_name}</TableCell>
                <TableCell>${drug.cost}</TableCell>
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
};
