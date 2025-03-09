"use client";
import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbar, GridPaginationModel } from "@mui/x-data-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LoadingPage from "@/components/loading_animation";
import { useAuth } from "@/context/AuthContext";

interface Visit {
  id: number;
  visit_date: string;
  visit_type: string;
  patient_name: string;
  patient_id: number;
}

interface VisitDetails {
  id: number;
  visit_date: string;
  visit_type: string;
  patient_name: string;
  patient_id: number;
  triage: any[];
  consultation: any[];
  lab: any[];
  pharmacy: any[];
  billing: any[];
}

const MedicalHistoryPage = () => {
  const [patientId, setPatientId] = useState<string>("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<VisitDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const { authState } = useAuth();

  // Fetch all visits
  const fetchAllVisits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/all-visits/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch visits");
      const data = await response.json();
      setVisits(data);
    } catch (error) {
      console.error("Error fetching visits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch visit details
  const fetchVisitDetails = async (visitId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visit-details/${visitId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch visit details");
      const data = await response.json();
      setSelectedVisit(data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching visit details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Columns for the DataGrid
  const columns = [
    { field: "id", headerName: "Visit ID", width: 100 },
    { field: "visit_date", headerName: "Visit Date", width: 150 },
    { field: "visit_type", headerName: "Visit Type", width: 150 },
    { field: "patient_name", headerName: "Patient Name", width: 200 },
    { field: "patient_id", headerName: "Patient ID", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params: any) => (
        <Button onClick={() => fetchVisitDetails(params.row.id)}>
          View Details
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchAllVisits();
  }, []);

  return (
    <div className="p-6">
      {isLoading && <LoadingPage />}
      <h1 className="text-2xl font-bold mb-6">Medical History</h1>

      {/* Patient ID Input */}
      <div className="flex items-center space-x-4 mb-6">
        <Input
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <Button onClick={fetchAllVisits}>Fetch All Visits</Button>
      </div>

      {/* Visits Table */}
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={visits}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20]}
          slots={{ toolbar: GridToolbar }}
        />
      </div>

      {/* Visit Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
            <DialogDescription>
              Details for Visit ID: {selectedVisit?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-6">
              {/* Visit Information */}
              <div>
                <h3 className="font-bold text-lg mb-2">Visit Information</h3>
                <div className="space-y-2">
                  <p>
                    <strong>Visit Date:</strong> {selectedVisit.visit_date}
                  </p>
                  <p>
                    <strong>Visit Type:</strong> {selectedVisit.visit_type}
                  </p>
                  <p>
                    <strong>Patient Name:</strong> {selectedVisit.patient_name}
                  </p>
                </div>
              </div>

              {/* Triage Details */}
              <div>
                <h3 className="font-bold text-lg mb-2">Triage Records</h3>
                {selectedVisit.triage.length > 0 ? (
                  selectedVisit.triage.map((record, index) => (
                    <div key={index} className="ml-4 space-y-2">
                      <p>
                        <strong>Pulse:</strong> {record.pulse}
                      </p>
                      <p>
                        <strong>Height:</strong> {record.height}
                      </p>
                      <p>
                        <strong>Weight:</strong> {record.weight}
                      </p>
                      <p>
                        <strong>Blood Pressure:</strong> {record.systolic}/
                        {record.diastolic}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No triage records found.</p>
                )}
              </div>

              {/* Consultation Details */}
              <div>
                <h3 className="font-bold text-lg mb-2">Consultation Records</h3>
                {selectedVisit.consultation.length > 0 ? (
                  selectedVisit.consultation.map((record, index) => (
                    <div key={index} className="ml-4 space-y-2">
                      <p>
                        <strong>Diagnosis:</strong> {record.diagnosis}
                      </p>
                      <p>
                        <strong>Prescription:</strong>
                      </p>
                      <ul className="ml-4">
                        {record.prescription.map(
                          (prescription: any, idx: number) => (
                            <li key={idx}>
                              {prescription.medication} - {prescription.dosage}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>No consultation records found.</p>
                )}
              </div>

              {/* Lab Details */}
              <div>
                <h3 className="font-bold text-lg mb-2">Lab Records</h3>
                {selectedVisit.lab.length > 0 ? (
                  selectedVisit.lab.map((record, index) => (
                    <div key={index} className="ml-4 space-y-2">
                      <p>
                        <strong>Test Name:</strong> {record.test_name}
                      </p>
                      <p>
                        <strong>Result:</strong> {record.result}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No lab records found.</p>
                )}
              </div>

              {/* Pharmacy Details */}
              <div>
                <h3 className="font-bold text-lg mb-2">Pharmacy Records</h3>
                {selectedVisit.pharmacy.length > 0 ? (
                  selectedVisit.pharmacy.map((record, index) => (
                    <div key={index} className="ml-4 space-y-2">
                      <p>
                        <strong>Medication:</strong> {record.medication_name}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {record.quantity}
                      </p>
                      <p>
                        <strong>Dispensed:</strong>{" "}
                        {record.dispensed ? "Yes" : "No"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No pharmacy records found.</p>
                )}
              </div>

              {/* Billing Details */}
              <div>
                <h3 className="font-bold text-lg mb-2">Billing Records</h3>
                {selectedVisit.billing.length > 0 ? (
                  selectedVisit.billing.map((record, index) => (
                    <div key={index} className="ml-4 space-y-2">
                      <p>
                        <strong>Total Cost:</strong> {record.total_cost}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No billing records found.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalHistoryPage;
