"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock data for demonstration
const mockPatient = {
  name: "John Doe",
  vitals: "BP: 120/80, HR: 72",
  historySummary: "Hypertension, Diabetes",
};

const testRequestsSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
});

const prescriptionSchema = z.object({
  medication: z.string().min(1, "Medication is required"),
  dosage: z.string().min(1, "Dosage is required"),
});

type TestRequest = z.infer<typeof testRequestsSchema>;
type Prescription = z.infer<typeof prescriptionSchema>;

const PatientManagementPage = () => {
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [testRequests, setTestRequests] = useState<TestRequest[]>([

  ]);
  // const [labResults, setLabResults] = useState<string[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showTestRequestPreview, setShowTestRequestPreview] = useState(false);
  const [showPrescriptionPreview, setShowPrescriptionPreview] = useState(false);
// Add a state to track if the diagnosis has been saved
const [isDiagnosisSaved, setIsDiagnosisSaved] = useState<boolean>(false);

// Function to handle saving the diagnosis
const handleSaveDiagnosis = async () => {
  try {
    // Simulate an API call to save the diagnosis
    console.log("Saving diagnosis:", diagnosis);
    // await axios.post("/api/diagnosis", { diagnosis });
    setIsDiagnosisSaved(true);
    alert("Diagnosis saved successfully!");
  } catch (error) {
    console.error("Failed to save diagnosis:", error);
    alert("Failed to save diagnosis. Please try again.");
  }
};
  const {
    control: testRequestControl,
    handleSubmit: handleTestRequestSubmit,
    reset: resetTestRequestForm,
  } = useForm<TestRequest>({
    resolver: zodResolver(testRequestsSchema),
  });

  const {
    control: prescriptionControl,
    handleSubmit: handlePrescriptionSubmit,
    reset: resetPrescriptionForm,
  } = useForm<Prescription>({
    resolver: zodResolver(prescriptionSchema),
  });

  const handleAddTestRequest = (data: TestRequest) => {
    setTestRequests([...testRequests, data]);
    resetTestRequestForm();
  };

  const handleAddPrescription = (data: Prescription) => {
    setPrescriptions([...prescriptions, data]);
    resetPrescriptionForm();
  };

  const handleDeleteTestRequest = (index: number) => {
    console.log("Deleting test request at index:", index); // Debugging
    setTestRequests(testRequests.filter((_, i) => i !== index));
  };

  const handleDeletePrescription = (index: number) => {
    console.log("Deleting prescription at index:", index); // Debugging
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSaveTestRequests = async () => {
    try {
      // Simulate API call to save test requests
      console.log("Saving test requests:", testRequests);
      // await axios.post("/api/test-requests", testRequests);
      setShowTestRequestPreview(false);
      alert("Test requests saved successfully!");
    } catch (error) {
      console.error("Failed to save test requests:", error);
    }
  };

  const handleSavePrescriptions = async () => {
    try {
      // Simulate API call to save prescriptions
      console.log("Saving prescriptions:", prescriptions);
      // await axios.post("/api/prescriptions", prescriptions);
      setShowPrescriptionPreview(false);
      alert("Prescriptions saved successfully!");
    } catch (error) {
      console.error("Failed to save prescriptions:", error);
    }
  };

  // Table columns for Test Requests
  const testRequestColumns: ColumnDef<TestRequest>[] = [
    {
      accessorKey: "testName",
      header: "Test Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        console.log("Rendering delete button for row:", row.index); // Debugging
        return (
          <Button
            variant="destructive"
            onClick={() => handleDeleteTestRequest(row.index)}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  // Table columns for Prescriptions
  const prescriptionColumns: ColumnDef<Prescription>[] = [
    {
      accessorKey: "medication",
      header: "Medication",
    },
    {
      accessorKey: "dosage",
      header: "Dosage",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        console.log("Rendering delete button for row:", row.index); // Debugging
        return (
          <Button
            variant="destructive"
            onClick={() => handleDeletePrescription(row.index)}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  // React Table for Test Requests
  const testRequestTable = useReactTable({
    data: testRequests,
    columns: testRequestColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // React Table for Prescriptions
  const prescriptionTable = useReactTable({
    data: prescriptions,
    columns: prescriptionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6">
      {/* Patient Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{mockPatient.name}</CardTitle>
          <p>Vitals: {mockPatient.vitals}</p>
          <p>History: {mockPatient.historySummary}</p>
          <Button variant="outline" onClick={() => console.log("Go back")}>
            Back to Patient List
          </Button>
        </CardHeader>
      </Card>

      {/* Dynamic Tabs */}
      <Tabs defaultValue="diagnosis" className="w-full">
        <TabsList>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="medicalHistory">Medical History</TabsTrigger>
          <TabsTrigger value="testRequests">Test Requests</TabsTrigger>
          <TabsTrigger value="labResults">Lab Results</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        {/* Diagnosis Section */}
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={diagnosis}
                onChange={(e) => {setDiagnosis(e.target.value);setIsDiagnosisSaved(false)}}
                placeholder="Enter diagnosis..."
                
              />
              <Button
                className="mt-4"
                onClick={handleSaveDiagnosis}
                disabled={isDiagnosisSaved} // Disable the button if diagnosis is already saved
              >
                {isDiagnosisSaved ? "Diagnosis Saved" : "Save Diagnosis"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Section */}
        <TabsContent value="medicalHistory">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Fetch and display past records here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Requests Section */}
        <TabsContent value="testRequests">
          <Card>
            <CardHeader>
              <CardTitle>Test Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestRequestSubmit(handleAddTestRequest)}>
                <Controller
                  name="testName"
                  control={testRequestControl}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter test name" />
                  )}
                />
                <Button type="submit" className="mt-4">
                  Add Test Request
                </Button>
              </form>
              <Table>
                <TableHeader>
                  {testRequestTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.column.columnDef.header as string}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {testRequestTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.renderValue() as string}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                className="mt-4"
                onClick={() => setShowTestRequestPreview(true)}
              >
                Save Test Requests
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results Section */}
        <TabsContent value="labResults">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Display lab results here once updated by the lab.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Section */}
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePrescriptionSubmit(handleAddPrescription)}>
                <Controller
                  name="medication"
                  control={prescriptionControl}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter medication" />
                  )}
                />
                <div className="mt-4">
                <Controller
                
                  name="dosage"
                  control={prescriptionControl}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter dosage" />
                  )}
                />
                </div>
                <Button type="submit" className="mt-4">
                  Add Prescription
                </Button>
              </form>
              <Table>
                <TableHeader>
                  {prescriptionTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.column.columnDef.header as string}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {prescriptionTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.renderValue() as string}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                className="mt-4"
                onClick={() => setShowPrescriptionPreview(true)}
              >
                Save Prescriptions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Request Preview Dialog */}
      <AlertDialog
        open={showTestRequestPreview}
        onOpenChange={setShowTestRequestPreview}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review Test Requests</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the test requests before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Table>
            <TableHeader>
              {testRequestTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.column.columnDef.header as string}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {testRequestTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.renderValue() as string}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveTestRequests}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Prescription Preview Dialog */}
      <AlertDialog
        open={showPrescriptionPreview}
        onOpenChange={setShowPrescriptionPreview}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review Prescriptions</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the prescriptions before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Table>
            <TableHeader>
              {prescriptionTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.column.columnDef.header as string}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {prescriptionTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.renderValue() as string}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSavePrescriptions}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatientManagementPage;
