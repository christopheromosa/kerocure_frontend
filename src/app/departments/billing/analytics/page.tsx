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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

// Define the schema for billing data
const billingSchema = z.object({
  consultationFee: z.coerce
    .number()
    .min(0, "Consultation fee must be a positive number"),
  labTests: z.array(
    z.object({
      id: z.number(),
      test_name: z.string(),
      cost: z.coerce.number().min(0, "Cost must be a positive number"),
    })
  ),
  pharmacy: z.array(
    z.object({
      id: z.number(),
      medication_name: z.string(),
      cost: z.coerce.number().min(0, "Cost must be a positive number"),
    })
  ),
});

type BillingType = z.infer<typeof billingSchema> & {
  id: number;
  totalCost: number;
  visit: number;
  recorded_by: number;
};

export default function BillingTable() {
  const [billingData, setBillingData] = useState<BillingType[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<BillingType | null>(
    null
  );
  const { authState } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BillingType>({
    resolver: zodResolver(billingSchema),
  });

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const res = await fetch("http://localhost:8000/billing/", {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setBillingData(data);
        } else {
          console.error("Failed to fetch billing data");
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
      }
    };

    fetchBillingData();
  }, [authState?.token]);

  // Handle edit dialog open
  const handleEditClick = (billing: BillingType) => {
    setSelectedBilling(billing);
    reset(billing); // Pre-fill the form with the selected billing data
    setIsEditDialogOpen(true);
  };

  // Handle delete dialog open
  const handleDeleteClick = (billing: BillingType) => {
    setSelectedBilling(billing);
    setIsDeleteDialogOpen(true);
  };

  // Handle edit form submission
  const onSubmit = async (data: BillingType) => {
    if (!selectedBilling) return;

    try {
      const res = await fetch(
        `http://localhost:8000/billing/${selectedBilling.id}/`,
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
        const updatedBilling = await res.json();
        setBillingData((prev) =>
          prev.map((b) => (b.id === updatedBilling.id ? updatedBilling : b))
        );
        setIsEditDialogOpen(false);
        toast({
          title: "Success",
          description: "Billing data updated successfully!",
        });
      } else {
        console.error("Failed to update billing data");
      }
    } catch (error) {
      console.error("Error updating billing data:", error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedBilling) return;

    try {
      const res = await fetch(
        `http://localhost:8000/billing/${selectedBilling.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (res.ok) {
        setBillingData((prev) =>
          prev.filter((b) => b.id !== selectedBilling.id)
        );
        setIsDeleteDialogOpen(false);
        toast({
          title: "Success",
          description: "Billing data deleted successfully!",
        });
      } else {
        console.error("Failed to delete billing data");
      }
    } catch (error) {
      console.error("Error deleting billing data:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Billing Data</h1>

      {/* Billing Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Consultation Fee</TableHead>
            <TableHead>Lab Tests</TableHead>
            <TableHead>Pharmacy</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billingData.map((billing) => (
            <TableRow key={billing.id}>
              <TableCell>{billing.id}</TableCell>
              <TableCell>${billing.consultationFee.toFixed(2)}</TableCell>
              <TableCell>
                {billing.labTests.map((test) => (
                  <div key={test.id}>
                    {test.test_name}: ${test.cost.toFixed(2)}
                  </div>
                ))}
              </TableCell>
              <TableCell>
                {billing.pharmacy.map((med) => (
                  <div key={med.id}>
                    {med.medication_name}: ${med.cost.toFixed(2)}
                  </div>
                ))}
              </TableCell>
              <TableCell>${billing.totalCost.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => handleEditClick(billing)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteClick(billing)}
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
            <DialogTitle>Edit Billing Data</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="consultationFee">Consultation Fee</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  {...register("consultationFee")}
                />
                {errors.consultationFee && (
                  <p className="text-red-500 text-sm">
                    {errors.consultationFee.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="labTests">Lab Tests</Label>
                {selectedBilling?.labTests.map((test, index) => (
                  <div key={test.id} className="mb-2">
                    <Input
                      type="text"
                      value={test.test_name}
                      readOnly
                      className="mb-1"
                    />
                    <Input
                      type="number"
                      {...register(`labTests.${index}.cost`)}
                      placeholder="Enter cost"
                    />
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="pharmacy">Pharmacy</Label>
                {selectedBilling?.pharmacy.map((med, index) => (
                  <div key={med.id} className="mb-2">
                    <Input
                      type="text"
                      value={med.medication_name}
                      readOnly
                      className="mb-1"
                    />
                    <Input
                      type="number"
                      {...register(`pharmacy.${index}.cost`)}
                      placeholder="Enter cost"
                    />
                  </div>
                ))}
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
            billing data.
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
  );
}
