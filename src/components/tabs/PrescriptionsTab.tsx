import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import OrganizationInfo from "../OrganizationInfo";
import axios from "axios";
import { Input } from "../ui/input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export const PrescriptionsTab = ({
  prescriptions,
  setPrescriptions,
  handleSaveDrugPrescriptions,
  note_id,
  visit,
  visitData,
  patientId
}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<any[]>(prescriptions);
  const { authState } = useAuth();

  // Fetch drugs on component mount
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/drugs/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        setDrugs(response.data);
      } catch (error) {
        console.error("Failed to fetch drugs:", error);
      }
    };

    fetchDrugs();
  }, [authState.token]);

  // Sync selectedDrugs with parent's prescriptions
  useEffect(() => {
    setSelectedDrugs(prescriptions);
  }, [prescriptions]);

  // Handle drug search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle adding a drug to the selected list
  const handleAddDrug = (drug: any) => {
    const updatedDrugs = [
      ...selectedDrugs,
      {
        ...drug,
        dosage: "",
        prescribed_quantity:"",
        root: "",
        strength: "",
        frequency: "",
        duration: "",
      },
    ];
    setSelectedDrugs(updatedDrugs);
    setPrescriptions(updatedDrugs);
    setSearchTerm("");
  };

  // Handle deleting a drug from the selected list
  const handleDeleteDrug = (index: number) => {
    const updatedDrugs = selectedDrugs.filter((_, i) => i !== index);
    setSelectedDrugs(updatedDrugs);
    setPrescriptions(updatedDrugs);
  };

  // Handle saving prescriptions
  const handleSavePrescriptions = async () => {
    try {
      await handleSaveDrugPrescriptions();
      setIsDialogOpen(false);
      setIsConfirmationDialogOpen(true); // Open confirmation dialog
      toast.success("Prescriptions saved successfully!", { autoClose: 1000 });
    } catch (error) {
      console.error("Failed to save prescriptions:", error);
      toast.error("Failed to save prescriptions. Please try again.");
    }
  };

  // Handle confirming payment (without disease selection)
  const handleConfirmPayment = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/${visitData?.visit_id}/`,
        {
          patient: patientId,
          current_state: "CONSULTATION",
          next_state: "PHARMACY",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      toast.success("Patient redirected to Pharmacy successfully!", {
        autoClose: 1000,
      });
      window.location.reload()
      setIsConfirmationDialogOpen(false); // Close confirmation dialog
    } catch (error) {
      console.error("Failed to redirect to Pharmacy:", error);
      toast.error("Failed to redirect to Pharmacy. Please try again.");
    }
  };

  // Filter drugs based on the search term
  const filteredDrugs = searchTerm.trim()
    ? drugs.filter((drug) =>
        drug.drug_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Calculate the total cost of selected drugs
  const totalCost = selectedDrugs.reduce(
    (sum, drug) => sum + parseInt(drug.cost),
    0
  );

  return (
    <Card>
      <CardHeader className="mt-0 pt-0">
        <CardTitle>
          <OrganizationInfo />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* "Add Prescription" Button */}
        <Button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          Add Prescription
        </Button>

        {/* Card-based layout for selected drugs */}
        <div className="mt-6 space-y-4">
          {selectedDrugs.map((drug: any, index: number) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{drug.drug_name}</h3>
                  <p className="text-sm text-gray-600">Cost: Ksh {drug.cost}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteDrug(index)}
                >
                  Delete
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                
                <Input
                  type="text"
                  placeholder="Root"
                  value={drug.root}
                  onChange={(e) => {
                    const updatedDrugs = [...selectedDrugs];
                    updatedDrugs[index].root = e.target.value;
                    setSelectedDrugs(updatedDrugs);
                    setPrescriptions(updatedDrugs);
                  }}
                />
                <Input
                  type="text"
                  placeholder="Strength"
                  value={drug.strength}
                  onChange={(e) => {
                    const updatedDrugs = [...selectedDrugs];
                    updatedDrugs[index].strength = e.target.value;
                    setSelectedDrugs(updatedDrugs);
                    setPrescriptions(updatedDrugs);
                  }}
                />
                <Input
                  type="text"
                  placeholder="Frequency"
                  value={drug.frequency}
                  onChange={(e) => {
                    const updatedDrugs = [...selectedDrugs];
                    updatedDrugs[index].frequency = e.target.value;
                    setSelectedDrugs(updatedDrugs);
                    setPrescriptions(updatedDrugs);
                  }}
                />
                <Input
                  type="text"
	               placeholder="Quantity"
                   value={drug.prescribed_quantity}
                   onChange={(e) => {
                     const updatedDrugs = [...selectedDrugs];
                     updatedDrugs[index].prescribed_quantity = e.target.value;
                     setSelectedDrugs(updatedDrugs);
                     setPrescriptions(updatedDrugs);
                   }}
                  />
                <Input
                  type="text"
                  placeholder="Duration"
                  value={drug.duration}
                  onChange={(e) => {
                    const updatedDrugs = [...selectedDrugs];
                    updatedDrugs[index].duration = e.target.value;
                    setSelectedDrugs(updatedDrugs);
                    setPrescriptions(updatedDrugs);
                  }}
                />
                
                <Textarea
                  placeholder="Other details"
                  value={drug.dosage}
                  onChange={(e) => {
                    const updatedDrugs = [...selectedDrugs];
                    updatedDrugs[index].dosage = e.target.value;
                    setSelectedDrugs(updatedDrugs);
                    setPrescriptions(updatedDrugs);
                  }}
                  className="col-span-2" // Span across two columns
                />
              </div>
            </Card>
          ))}
        </div>

        {/* "Save Prescriptions" Button */}
        {selectedDrugs.length > 0 && (
          <Button onClick={handleSavePrescriptions} className="mt-4 mr-4">
            Save Drug Prescriptions
          </Button>
        )}

        {/* Table for existing prescriptions (read-only) */}
        {visitData?.consultation_data?.prescription?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Previously Prescribed Drugs</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Cost (Ksh)</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Root</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitData.consultation_data.prescription.map(
                  (drug: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{drug.drug_name}</TableCell>
                      <TableCell>{drug.cost}</TableCell>
                      <TableCell>{drug.dosage}</TableCell>
                      <TableCell>{drug.root}</TableCell>
                      <TableCell>{drug.strength}</TableCell>
                      <TableCell>{drug.frequency}</TableCell>
                      <TableCell>{drug.prescribed_quantity}</TableCell>
                      <TableCell>{drug.duration}</TableCell>
                      <TableCell>{drug.status}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={isConfirmationDialogOpen}
          onOpenChange={setIsConfirmationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>Total Amount to Pay:</strong> Ksh {totalCost}
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleConfirmPayment}>
                Confirm and Proceed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Prescription Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Prescription</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search drugs..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {filteredDrugs.length > 0 && (
              <ul className="mt-2 border rounded-lg p-2 max-h-40 overflow-y-auto">
                {filteredDrugs.map((drug, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => handleAddDrug(drug)}
                  >
                    <div className="flex justify-between">
                      <span>{drug.drug_name}</span>
                      <span>{drug.quantity}</span>
                      <span>Ksh {drug.cost}</span>
                      <span>{drug.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ToastContainer />
      </CardContent>
    </Card>
  );
};
