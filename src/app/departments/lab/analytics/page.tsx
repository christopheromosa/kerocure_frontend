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

// Define the schema for lab result data
const labResultSchema = z.object({
  test_name: z.string().min(1, "Test name is required"),
  result: z.string().min(1, "Result is required"),
});

type LabResultType = z.infer<typeof labResultSchema> & {
  id: number;
  visit: number;
  recorded_by: number;
};

export default function LabResultsTable() {
  const [labResults, setLabResults] = useState<LabResultType[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLabResult, setSelectedLabResult] =
    useState<LabResultType | null>(null);
  const { authState } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LabResultType>({
    resolver: zodResolver(labResultSchema),
  });

  // Fetch lab results data
  useEffect(() => {
    const fetchLabResults = async () => {
      try {
        const res = await fetch("http://localhost:8000/lab/", {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setLabResults(data);
        } else {
          console.error("Failed to fetch lab results");
        }
      } catch (error) {
        console.error("Error fetching lab results:", error);
      }
    };

    fetchLabResults();
  }, [authState?.token]);

  // Handle edit dialog open
  const handleEditClick = (labResult: LabResultType) => {
    setSelectedLabResult(labResult);
    reset(labResult); // Pre-fill the form with the selected lab result data
    setIsEditDialogOpen(true);
  };

  // Handle delete dialog open
  const handleDeleteClick = (labResult: LabResultType) => {
    setSelectedLabResult(labResult);
    setIsDeleteDialogOpen(true);
  };

  // Handle edit form submission
  const onSubmit = async (data: LabResultType) => {
    if (!selectedLabResult) return;

    try {
      const res = await fetch(
        `http://localhost:8000/lab/${selectedLabResult.id}/`,
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
        const updatedLabResult = await res.json();
        setLabResults((prev) =>
          prev.map((lr) =>
            lr.id === updatedLabResult.id ? updatedLabResult : lr
          )
        );
        setIsEditDialogOpen(false);
        toast({
          title: "Success",
          description: "Lab result updated successfully!",
        });
      } else {
        console.error("Failed to update lab result");
      }
    } catch (error) {
      console.error("Error updating lab result:", error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedLabResult) return;

    try {
      const res = await fetch(
        `http://localhost:8000/lab/${selectedLabResult.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (res.ok) {
        setLabResults((prev) =>
          prev.filter((lr) => lr.id !== selectedLabResult.id)
        );
        setIsDeleteDialogOpen(false);
        toast({
          title: "Success",
          description: "Lab result deleted successfully!",
        });
      } else {
        console.error("Failed to delete lab result");
      }
    } catch (error) {
      console.error("Error deleting lab result:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lab Results</h1>

      {/* Lab Results Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Test Name</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labResults.map((labResult) => (
            <TableRow key={labResult.id}>
              <TableCell>{labResult.id}</TableCell>
              <TableCell>{labResult.test_name}</TableCell>
              <TableCell>{labResult.result}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => handleEditClick(labResult)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteClick(labResult)}
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
            <DialogTitle>Edit Lab Result</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="test_name">Test Name</Label>
                <Input id="test_name" {...register("test_name")} />
                {errors.test_name && (
                  <p className="text-red-500 text-sm">
                    {errors.test_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="result">Result</Label>
                <Input id="result" {...register("result")} />
                {errors.result && (
                  <p className="text-red-500 text-sm">
                    {errors.result.message}
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
            This action cannot be undone. This will permanently delete the lab
            result.
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
