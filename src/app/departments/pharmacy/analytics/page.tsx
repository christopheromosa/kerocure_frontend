"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";

// Define the schema for medication data
const medicationSchema = z.object({
  medication_name: z.string().min(1, "Medication name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
});

type MedicationType = z.infer<typeof medicationSchema> & {
  id: number;
  visit: number;
  dispensed_by: number;
};

export default function MedicationTable() {
  const [medicationData, setMedicationData] = useState<MedicationType[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  // const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationType>({
    resolver: zodResolver(medicationSchema),
  });

  // Fetch medication data
  useEffect(() => {
    const fetchMedicationData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:8000/pharmacy/", {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setMedicationData(data);
          setIsLoading(false);
        } else {
          console.error("Failed to fetch medication data");
        }
      } catch (error) {
        console.error("Error fetching medication data:", error);
      }
    };

    fetchMedicationData();
  }, [authState?.token]);

  // Handle edit dialog open
  const handleEditClick = (medication: MedicationType) => {
    setSelectedMedication(medication);
    reset(medication); // Pre-fill the form with the selected medication data
    setIsEditDialogOpen(true);
  };

  // Handle delete dialog open
  const handleDeleteClick = (medication: MedicationType) => {
    setSelectedMedication(medication);
    setIsDeleteDialogOpen(true);
  };

  // Handle edit form submission
  const onSubmit = async (data: MedicationType) => {
    if (!selectedMedication) return;

    try {
      const res = await fetch(
        `http://localhost:8000/pharmacy/${selectedMedication.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        const updatedMedication = await res.json();
        setMedicationData((prev) =>
          prev.map((m) =>
            m.id === updatedMedication.id ? updatedMedication : m
          )
        );
        setIsEditDialogOpen(false);
        // toast({
        //   title: "Success",
        //   description: "Medication data updated successfully!",
        // });
      } else {
        console.error("Failed to update medication data");
      }
    } catch (error) {
      console.error("Error updating medication data:", error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedMedication) return;

    try {
      const res = await fetch(
        `http://localhost:8000/pharmacy/${selectedMedication.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (res.ok) {
        setMedicationData((prev) =>
          prev.filter((m) => m.id !== selectedMedication.id)
        );
        setIsDeleteDialogOpen(false);
        // toast({
        //   title: "Success",
        //   description: "Medication data deleted successfully!",
        // });
      } else {
        console.error("Failed to delete medication data");
      }
    } catch (error) {
      console.error("Error deleting medication data:", error);
    }
  };

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Medication Data</h1>

        {/* Medication Data Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Medication Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicationData.map((medication) => (
              <TableRow key={medication.id}>
                <TableCell>{medication.id}</TableCell>
                <TableCell>{medication.medication_name}</TableCell>
                <TableCell>{medication.quantity}</TableCell>
                <TableCell>${medication.cost.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleEditClick(medication)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteClick(medication)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Medication Data</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="medication_name">Medication Name</Label>
                  <Input
                    id="medication_name"
                    {...register("medication_name")}
                  />
                  {errors.medication_name && (
                    <p className="text-red-500 text-sm">
                      {errors.medication_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    {...register("quantity")}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input id="cost" type="number" {...register("cost")} />
                  {errors.cost && (
                    <p className="text-red-500 text-sm">
                      {errors.cost.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <p>
              This action cannot be undone. This will permanently delete the
              medication data.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
