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
import { LabTestForm } from "@/components/forms/lab-test-form";

export default function LabTestManagement() {
  const [labTests, setLabTests] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLabTest, setCurrentLabTest] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [labTestToDelete, setLabTestToDelete] = useState<any>(null);

  // Fetch lab tests from the backend
  const fetchLabTests = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/labtests/`
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
          labTest
        );
        toast.success("Lab test updated successfully!");
      } else {
        // Add new lab test
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/labtests/`,
          labTest
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
        `${process.env.NEXT_PUBLIC_API_URL}/labtests/${labTestToDelete.id}/`
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Test Management</CardTitle>
      </CardHeader>
      <CardContent>
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
                <TableCell>${labTest.cost}</TableCell>
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
