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

export const MedicalHistoryTab = ({ visits }: any) => {
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchDate, setSearchDate] = useState("");

  // Fetch visit details from the backend API
  const handleViewVisit = async (visitId: any) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patient_visits_details/${visitId}`
      );
      setSelectedVisit(response.data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch visit details:", error);
    }
  };

  // Filter visits by the selected date
  const filteredVisits = searchDate
    ? visits.filter((visit: any) =>
        new Date(visit.date).toLocaleDateString().includes(searchDate)
      )
    : visits;

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
              <TableRow key={visit.id}>
                <TableCell>
                  {new Date(visit.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleViewVisit(visit.id)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Visit Details</DialogTitle>
            </DialogHeader>
            {selectedVisit && (
              <div className="space-y-4">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedVisit.visit_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Type of Visit :</strong>{" "}
                  {selectedVisit.visit_type || "N/A"}
                </p>

                {/* Triage Section */}
                <h3 className="font-semibold">Triage</h3>
                {selectedVisit.triage.length > 0 ? (
                  <ul>
                    {selectedVisit.triage.map((t: any) => (
                      <li key={t.id}>
                        Blood Pressure: {t.blood_pressure}, Temperature:{" "}
                        {t.temperature}°C, Weight: {t.weight} kg
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No triage data available.</p>
                )}

                {/* Consultation Section */}
                <h3 className="font-semibold">Consultation</h3>
                {selectedVisit.consultation.length > 0 ? (
                  <ul>
                    {selectedVisit.consultation.map((c: any) => (
                      <li key={c.id}>
                        <strong>Doctor:</strong> {c.doctor} <br />
                        <strong>Diagnosis:</strong> {c.diagnosis} <br />
                        <strong>Prescription:</strong> {c.prescription}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No consultation data available.</p>
                )}

                {/* Lab Section */}
                <h3 className="font-semibold">Lab Tests</h3>
                {selectedVisit.lab.length > 0 ? (
                  <ul>
                    {selectedVisit.lab.map((l: any) => (
                      <li key={l.id}>
                        <strong>Test:</strong> {l.test_name} <br />
                        <strong>Result:</strong> {l.test_result} <br />
                        <strong>Date:</strong>{" "}
                        {new Date(l.test_date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No lab tests available.</p>
                )}

                {/* Pharmacy Section */}
                <h3 className="font-semibold">Medications</h3>
                {selectedVisit.pharmacy.length > 0 ? (
                  <ul>
                    {selectedVisit.pharmacy.map((p: any) => (
                      <li key={p.id}>
                        {p.medication_name} - {p.dosage} <br />
                        <strong>Issued:</strong>{" "}
                        {new Date(p.issued_date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No medications prescribed.</p>
                )}

                {/* Billing Section */}
                <h3 className="font-semibold">Billing</h3>
                {selectedVisit.billing.length > 0 ? (
                  <ul>
                    {selectedVisit.billing.map((b: any) => (
                      <li key={b.id}>
                        <strong>Total Cost:</strong> ${b.total_cost} <br />
                        <strong>Payment Status:</strong> {b.payment_status}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No billing records found.</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => window.print()}>Print</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
