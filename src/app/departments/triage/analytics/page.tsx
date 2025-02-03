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
import LoadingPage from "@/components/loading_animation";
import PageTransition from "@/components/PageTransition";

// Define the schema for triage data
const triageSchema = z.object({
  weight: z.coerce.number().min(1, "Weight must be a valid number"),
  height: z.coerce.number().min(1, "Height must be a valid number"),
  systolic: z.coerce.number().min(1, "Systolic pressure is required"),
  diastolic: z.coerce.number().min(1, "Diastolic pressure is required"),
  pulse: z.coerce.number().min(1, "Pulse rate is required"),
});

type TriageType = z.infer<typeof triageSchema> & {
  id: number;
  visit: number;
  recorded_by: number;
};

export default function TriageTable() {
  const [triageData, setTriageData] = useState<TriageType[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTriage, setSelectedTriage] = useState<TriageType | null>(null);
   const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  // const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TriageType>({
    resolver: zodResolver(triageSchema),
  });

  // Fetch triage data
  useEffect(() => {
    const fetchTriageData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:8000/triage/", {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setTriageData(data);
          console.log(data);
           setIsLoading(false);
        } else {
          console.error("Failed to fetch triage data");
        }
      } catch (error) {
        console.error("Error fetching triage data:", error);
      }
    };

    fetchTriageData();
  }, [authState?.token]);

  // Handle edit dialog open
  const handleEditClick = (triage: TriageType) => {
    setSelectedTriage(triage);
    reset(triage); // Pre-fill the form with the selected triage data
    setIsEditDialogOpen(true);
  };

  // Handle delete dialog open
  const handleDeleteClick = (triage: TriageType) => {
    setSelectedTriage(triage);
    setIsDeleteDialogOpen(true);
  };

  // Handle edit form submission
  const onSubmit = async (data: TriageType) => {
    if (!selectedTriage) return;

    try {
      const res = await fetch(
        `http://localhost:8000/triage/${selectedTriage.id}/`,
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
        const updatedTriage = await res.json();
        setTriageData((prev) =>
          prev.map((t) => (t.id === updatedTriage.id ? updatedTriage : t))
        );
        setIsEditDialogOpen(false);
        // toast({
        //   title: "Success",
        //   description: "Triage data updated successfully!",
        // });
      } else {
        console.error("Failed to update triage data");
      }
    } catch (error) {
      console.error("Error updating triage data:", error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedTriage) return;

    try {
      const res = await fetch(
        `http://localhost:8000/triage/${selectedTriage.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (res.ok) {
        setTriageData((prev) => prev.filter((t) => t.id !== selectedTriage.id));
        setIsDeleteDialogOpen(false);
        // toast({
        //   title: "Success",
        //   description: "Triage data deleted successfully!",
        // });
      } else {
        console.error("Failed to delete triage data");
      }
    } catch (error) {
      console.error("Error deleting triage data:", error);
    }
  };

  return (
    <PageTransition>
    {isLoading && <LoadingPage />}

    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Triage Data</h1>

      {/* Triage Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Height</TableHead>
            <TableHead>Systolic</TableHead>
            <TableHead>Diastolic</TableHead>
            <TableHead>Pulse</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {triageData.map((triage) => (
            <TableRow key={triage.triage_id}>
              <TableCell>{triage.triage_id}</TableCell>
              <TableCell>{triage.vital_signs.weight}</TableCell>
              <TableCell>{triage.vital_signs.height}</TableCell>
              <TableCell>{triage.vital_signs.systolic}</TableCell>
              <TableCell>{triage.vital_signs.diastolic}</TableCell>
              <TableCell>{triage.vital_signs.pulse}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => handleEditClick(triage)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteClick(triage)}
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
            <DialogTitle>Edit Triage Data</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" {...register("weight")} />
                {errors.weight && (
                  <p className="text-red-500 text-sm">
                    {errors.weight.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input id="height" {...register("height")} />
                {errors.height && (
                  <p className="text-red-500 text-sm">
                    {errors.height.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="systolic">Systolic</Label>
                <Input id="systolic" {...register("systolic")} />
                {errors.systolic && (
                  <p className="text-red-500 text-sm">
                    {errors.systolic.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="diastolic">Diastolic</Label>
                <Input id="diastolic" {...register("diastolic")} />
                {errors.diastolic && (
                  <p className="text-red-500 text-sm">
                    {errors.diastolic.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="pulse">Pulse</Label>
                <Input id="pulse" {...register("pulse")} />
                {errors.pulse && (
                  <p className="text-red-500 text-sm">{errors.pulse.message}</p>
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
            triage data.
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
