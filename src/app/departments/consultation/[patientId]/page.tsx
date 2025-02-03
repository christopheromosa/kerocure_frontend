"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { useParams, useRouter } from "next/navigation";
import { useVisit } from "@/context/VisitContext";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";

const testRequestsSchema = z.object({
  test_name: z.string().min(1, "Test name is required"),
});

const prescriptionSchema = z.object({
  medication: z.string().min(1, "Medication is required"),
  dosage: z.string().min(1, "Dosage is required"),
});

type TestRequest = z.infer<typeof testRequestsSchema>;
type Prescription = z.infer<typeof prescriptionSchema>;

const PatientManagementPage = () => {
  const { patientId } = useParams();
  const router = useRouter();
  const { visitData, fetchVisitData } = useVisit();
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showTestRequestPreview, setShowTestRequestPreview] = useState(false);
  const [showPrescriptionPreview, setShowPrescriptionPreview] = useState(false);
  const [isDiagnosisSaved, setIsDiagnosisSaved] = useState<boolean>(false);
  const [consultationId, setConsultationId] = useState<number>();
  // const [labResults, setLabResults] = useState([]);
  const { authState } = useAuth();

  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [fetchVisitData, patientId]);

  const handleSaveDiagnosis = async () => {
    try {
      const res = await fetch(`/consultation/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify({
          diagnosis,
          prescription: null,
          lab_tests_ordered: null,
          physician: authState.user_id,
          visit: visitData?.visit_id,
          triage: visitData?.triage_data?.triage_id,
        }),
      });
      if (res.ok) {
        const consultation = await res.json();
        setConsultationId(consultation.note);
      }
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
    setTestRequests(testRequests.filter((_, i) => i !== index));
  };

  const handleDeletePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSaveTestRequests = async () => {
    try {
      await axios.patch(`/consultation/${consultationId}`, {
        lab_tests_ordered: testRequests,
      });
      setShowTestRequestPreview(false);
      alert("Test requests saved successfully!");
    } catch (error) {
      console.error("Failed to save test requests:", error);
    }
  };

  const handleSavePrescriptions = async () => {
    try {
      await axios.post(`/consultation/${consultationId}`, { prescriptions });
      setShowPrescriptionPreview(false);
      alert("Prescriptions saved successfully!");
    } catch (error) {
      console.error("Failed to save prescriptions:", error);
    }
  };

  const testRequestColumns: ColumnDef<TestRequest>[] = [
    {
      accessorKey: "test_name",
      header: "Test Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => handleDeleteTestRequest(row.index)}
        >
          Delete
        </Button>
      ),
    },
  ];

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
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => handleDeletePrescription(row.index)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const testRequestTable = useReactTable({
    data: testRequests,
    columns: testRequestColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const prescriptionTable = useReactTable({
    data: prescriptions,
    columns: prescriptionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageTransition>
      <div className="px-6">
        {/* Patient Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Name: {visitData?.visit_id}</CardTitle>
            <span>Vitals: {visitData?.triage_data?.triage_id}</span>
            <Button
              variant="outline"
              onClick={() => router.push("/departments/consultation")}
            >
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
                  onChange={(e) => {
                    setDiagnosis(e.target.value);
                    setIsDiagnosisSaved(false);
                  }}
                  placeholder="Enter diagnosis..."
                />
                <Button
                  className="mt-4"
                  onClick={handleSaveDiagnosis}
                  disabled={isDiagnosisSaved}
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
                <p>Fetch and display past records coming soon.</p>
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
                    name="test_name"
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
                {visitData?.lab_data?.length === 0 ? (
                  <p>Display lab results here once updated by the lab.</p>
                ) : (
                  visitData?.lab_data?.map((result, index) => (
                    <span key={index}>{result.result}</span>
                  ))
                )}
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
                <form
                  onSubmit={handlePrescriptionSubmit(handleAddPrescription)}
                >
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
    </PageTransition>
  );
};

export default PatientManagementPage;
