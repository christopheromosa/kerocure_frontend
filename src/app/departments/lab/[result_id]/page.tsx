// app/lab/[result_id]/page.tsx
"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock data for demonstration
const mockPatients = [
  {
    id: 1,
    name: "John Doe",
    tests: [{ id: 1, testName: "Blood Test", result: "" }],
  },
  {
    id: 2,
    name: "Jane Smith",
    tests: [{ id: 2, testName: "X-Ray", result: "" }],
  },
  {
    id: 3,
    name: "Alice Johnson",
    tests: [{ id: 3, testName: "Urine Test", result: "" }],
  },
];

const LabResultsPage = () => {
  const params = useParams();
  const resultId = params.result_id as string;
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // Find the selected patient
  const selectedPatient = mockPatients.find(
    (patient) => patient.id === parseInt(resultId)
  );

  // State for test results
  const [tests, setTests] = useState(selectedPatient?.tests || []);

  // Function to handle updating test results
  const handleResultChange = (testId: number, result: string) => {
    setTests((prev) =>
      prev.map((test) => (test.id === testId ? { ...test, result } : test))
    );
  };

  // Function to submit test results
  const handleSubmitResults = async () => {
    try {
      // Simulate API call to submit test results
      console.log("Submitting test results for patient:", {
        tests,
      });
      // await axios.post("/api/submit-test-results", { ... });
      setShowSuccessDialog(true); // Show success dialog
    } catch (error) {
      console.error("Failed to submit test results:", error);
      setShowErrorDialog(true); // Show error dialog
    }
  };

  if (!selectedPatient) {
    return <div className="p-6">Patient not found.</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Results for {selectedPatient.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.testName}</TableCell>
                  <TableCell>
                    <Input
                      value={test.result}
                      onChange={(e) =>
                        handleResultChange(test.id, e.target.value)
                      }
                      placeholder="Enter result"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-4" onClick={handleSubmitResults}>
            Submit Results
          </Button>
        </CardContent>
      </Card>

      {/* Success Alert Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Test results submitted successfully!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Alert Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              Failed to submit test results. Please try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LabResultsPage;
