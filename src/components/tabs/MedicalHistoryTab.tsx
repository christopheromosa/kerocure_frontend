import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import OrganizationInfo from "../OrganizationInfo";
import { useAuth } from "@/context/AuthContext";

export const MedicalHistoryTab = ({ visits }: any) => {
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const { authState } = useAuth();

  // Fetch visit details from the backend API
  const handleViewVisit = async (visitId: any) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patient_visits_details/${visitId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      setSelectedVisit(response.data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch visit details:", error);
    }
  };

  // Filter visits by the selected date
  const filteredVisits = searchDate
    ? visits.filter((visit: any) => {
        const visitDate = new Date(visit.visit_date)
          .toISOString()
          .split("T")[0]; // Format as YYYY-MM-DD
        return visitDate === searchDate;
      })
    : visits;

  // Print visit details
  const handlePrintVisitDetails = () => {
    const printContent = `
      <html>
        <head>
          <title>Visit Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .header {
              display: flex;
              align-items: center;
              flex-direction: column;
              gap: 1rem;
              justify-content: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header img {
              width: 150px;
              height: auto;
            }
            .header h2 {
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
              font-size: 14px;
            }
            .content {
              margin-top: 20px;
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
            }
            .content h3 {
              font-size: 18px;
              margin-bottom: 10px;
              grid-column: 1 / -1; /* Span across all columns */
            }
            .content ul {
              list-style-type: disc;
              padding-left: 20px;
            }
            .content li {
              margin-bottom: 10px;
            }
            .section {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              background-color: #f9f9f9;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/kerocureLogo-removebg-preview.png" alt="Organization Logo" />
            <div>
              <h2>KEROCURE MEDICAL CENTER</h2>
              <p>PO BOX: 3172 - 4255, KISII</p>
              <p>Email: Kerocure1@gmail.com</p>
              <p>Tel: +254711111111</p>
            </div>
          </div>
          <div class="content">
            <h1>Visit Details</h1>
            <div class="section">
              <p><strong>Date:</strong> ${new Date(
                selectedVisit.visit_date
              ).toLocaleDateString()}</p>
              <p><strong>Type of Visit:</strong> ${
                selectedVisit.visit_type || "N/A"
              }</p>
            </div>
  
            <!-- Triage Section -->
            <div class="section">
              <h3>Triage</h3>
              ${
                selectedVisit.triage
                  ? `
                  <ul>
                    <li><strong>Vital Signs:</strong></li>
                    <li>Pulse: ${selectedVisit.triage.vital_signs.pulse}</li>
                    <li>Height: ${selectedVisit.triage.vital_signs.height}</li>
                    <li>Weight: ${selectedVisit.triage.vital_signs.weight}</li>
                    <li>Blood Pressure: ${selectedVisit.triage.vital_signs.systolic}/${selectedVisit.triage.vital_signs.diastolic}</li>
                  </ul>
                `
                  : "<p>No triage data available.</p>"
              }
            </div>
  
            <!-- Consultation Section -->
            <div class="section">
              <h3>Consultation</h3>
              ${
                selectedVisit.consultation.length > 0
                  ? selectedVisit.consultation
                      .map(
                        (consultation: any) => `
                      <ul>
                        <li><strong>Diagnosis:</strong> ${
                          consultation.diagnosis
                        }</li>
                        <li><strong>Disease:</strong> ${
                          consultation.disease || "N/A"
                        }</li>
                        <li><strong>Prescription:</strong></li>
                        ${consultation.prescription
                          .map(
                            (p: any) => `
                          <li>${p.drug_name} - ${p.quantity} units (Cost: Ksh ${p.cost})</li>
                        `
                          )
                          .join("")}
                        <li><strong>Lab Tests Ordered:</strong></li>
                        ${consultation.lab_tests_ordered
                          .map(
                            (test: any) => `
                          <li>${test.service} - Cost: Ksh ${test.cost} (Duration: ${test.duration})</li>
                        `
                          )
                          .join("")}
                      </ul>
                    `
                      )
                      .join("")
                  : "<p>No consultation data available.</p>"
              }
            </div>
  
            <!-- Lab Section -->
            <div class="section">
              <h3>Lab Tests</h3>
              ${
                selectedVisit.lab.length > 0
                  ? selectedVisit.lab
                      .map(
                        (lab: any) => `
                      <ul>
                        ${lab.result
                          .map(
                            (result: any) => `
                          <li>
                            <strong>Test:</strong> ${result.service} <br />
                            <strong>Result:</strong> ${result.result} <br />
                            <strong>Cost:</strong> Ksh ${result.cost}
                          </li>
                        `
                          )
                          .join("")}
                      </ul>
                    `
                      )
                      .join("")
                  : "<p>No lab tests available.</p>"
              }
            </div>
  
            <!-- Pharmacy Section -->
            <div class="section">
              <h3>Medications</h3>
              ${
                selectedVisit.pharmacy.length > 0
                  ? selectedVisit.pharmacy
                      .map(
                        (pharmacy: any) => `
                      <ul>
                        ${pharmacy.prescriptions
                          .map(
                            (p: any) => `
                          <li>
                            <strong>Medication:</strong> ${p.medication_name} <br />
                            <strong>Quantity:</strong> ${p.quantity} <br />
                            <strong>Cost:</strong> Ksh ${p.cost}
                          </li>
                        `
                          )
                          .join("")}
                      </ul>
                    `
                      )
                      .join("")
                  : "<p>No medications prescribed.</p>"
              }
            </div>
  
            <!-- Billing Section -->
            <div class="section">
              <h3>Billing</h3>
              ${
                selectedVisit.billing.length > 0
                  ? selectedVisit.billing
                      .map(
                        (billing: any) => `
                      <ul>
                        <li><strong>Total Cost:</strong> Ksh ${billing.total_cost}</li>
                        <li><strong>Consultation Cost:</strong> Ksh ${billing.consultation_cost}</li>
                        <li><strong>Lab Cost:</strong> Ksh ${billing.laboratory_cost}</li>
                        <li><strong>Pharmacy Cost:</strong> Ksh ${billing.pharmacy_cost}</li>
                      </ul>
                    `
                      )
                      .join("")
                  : "<p>No billing records found.</p>"
              }
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <Card>
      <CardHeader className="mt-0 pt-0">
        <CardTitle>
          <OrganizationInfo />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="mb-4"
          placeholder="Search by date"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisits.map((visit: any) => (
              <TableRow key={visit.visit_id}>
                <TableCell>
                  {new Date(visit.visit_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white dark:text-white"
                    onClick={() => handleViewVisit(visit.visit_id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Dialog for Visit Details */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto w-full max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                <OrganizationInfo />
              </DialogTitle>
            </DialogHeader>
            {selectedVisit && (
              <div className="space-y-6">
                {/* General Visit Information */}
                <div className="space-y-2">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedVisit.visit_date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Type of Visit:</strong>{" "}
                    {selectedVisit.visit_type || "N/A"}
                  </p>
                </div>

                {/* Grid Layout for Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Triage Section */}
                  <div className="bg-gray-500 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Triage</h3>
                    {selectedVisit.triage ? (
                      <div className="space-y-2">
                        <p>
                          <strong>Vital Signs:</strong>
                        </p>
                        <ul className="list-disc pl-6">
                          <li>
                            Pulse: {selectedVisit.triage.vital_signs.pulse}
                          </li>
                          <li>
                            Height: {selectedVisit.triage.vital_signs.height}
                          </li>
                          <li>
                            Weight: {selectedVisit.triage.vital_signs.weight}
                          </li>
                          <li>
                            Blood Pressure:{" "}
                            {selectedVisit.triage.vital_signs.systolic}/
                            {selectedVisit.triage.vital_signs.diastolic}
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <p>No triage data available.</p>
                    )}
                  </div>

                  {/* Consultation Section */}
                  <div className="bg-gray-500 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-2">Consultation</h3>
                    {selectedVisit.consultation.length > 0 ? (
                      selectedVisit.consultation.map((consultation: any) => (
                        <div key={consultation.note_id} className="space-y-2">
                          <p>
                            <strong>Diagnosis:</strong> {consultation.diagnosis}
                          </p>
                          <p>
                            <strong>Disease:</strong>{" "}
                            {consultation.disease || "N/A"}
                          </p>
                          <p>
                            <strong>Prescription:</strong>
                          </p>
                          <ul className="list-disc pl-6">
                            {consultation.prescription.map((p: any) => (
                              <li key={p.id}>
                                {p.drug_name} - {p.quantity} units (Cost: Ksh{" "}
                                {p.cost})
                              </li>
                            ))}
                          </ul>
                          <p>
                            <strong>Lab Tests Ordered:</strong>
                          </p>
                          <ul className="list-disc pl-6">
                            {consultation.lab_tests_ordered.map((test: any) => (
                              <li key={test.id}>
                                {test.service} - Cost: Ksh {test.cost}{" "}
                                (Duration: {test.duration})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p>No consultation data available.</p>
                    )}
                  </div>

                  {/* Lab Section */}
                  <div className="bg-gray-500 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-2">Lab Tests</h3>
                    {selectedVisit.lab.length > 0 ? (
                      selectedVisit.lab.map((lab: any) => (
                        <div key={lab.result_id} className="space-y-2">
                          <ul className="list-disc pl-6">
                            {lab.result.map((result: any) => (
                              <li key={result.service}>
                                <strong>Test:</strong> {result.service} <br />
                                <strong>Result:</strong> {result.result} <br />
                                <strong>Cost:</strong> Ksh {result.cost}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p>No lab tests available.</p>
                    )}
                  </div>

                  {/* Pharmacy Section */}
                  <div className="bg-gray-500 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-2">Medications</h3>
                    {selectedVisit.pharmacy.length > 0 ? (
                      selectedVisit.pharmacy.map((pharmacy: any) => (
                        <div key={pharmacy.medication_id} className="space-y-2">
                          <ul className="list-disc pl-6">
                            {pharmacy.prescriptions.map((p: any) => (
                              <li key={p.id}>
                                <strong>Medication:</strong> {p.medication_name}{" "}
                                <br />
                                <strong>Quantity:</strong> {p.quantity} <br />
                                <strong>Cost:</strong> Ksh {p.cost}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p>No medications prescribed.</p>
                    )}
                  </div>

                  {/* Billing Section */}
                  <div className="bg-gray-500 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-2">Billing</h3>
                    {selectedVisit.billing.length > 0 ? (
                      selectedVisit.billing.map((billing: any) => (
                        <div key={billing.bill_id} className="space-y-2">
                          <ul className="list-disc pl-6">
                            <li>
                              <strong>Total Cost:</strong> Ksh{" "}
                              {billing.total_cost}
                            </li>
                            <li>
                              <strong>Consultation Cost:</strong> Ksh{" "}
                              {billing.consultation_cost}
                            </li>
                            <li>
                              <strong>Lab Cost:</strong> Ksh{" "}
                              {billing.laboratory_cost}
                            </li>
                            <li>
                              <strong>Pharmacy Cost:</strong> Ksh{" "}
                              {billing.pharmacy_cost}
                            </li>
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p>No billing records found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handlePrintVisitDetails}>Print</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
