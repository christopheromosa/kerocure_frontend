import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import OrganizationInfo from "../OrganizationInfo";
import axios from "axios";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";

export const PrescriptionsTab = ({
  prescriptions,
  setPrescriptions,
  handleSaveDrugPrescriptions,
  note_id,
  diagnosis,
  visit
}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<any[]>(prescriptions);
  const [diseaseSearchTerm, setDiseaseSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allDiseases, setAllDiseases] = useState<any[]>([]);
  const [isAddDiseaseDialogOpen, setIsAddDiseaseDialogOpen] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");
  const router = useRouter();
  const { authState } = useAuth();

  console.log(note_id,diagnosis,visit);

  // Fetch drugs and diseases on component mount
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

    const fetchDiseases = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/diseases/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        setAllDiseases(response.data);
      } catch (error) {
        console.error("Failed to fetch diseases:", error);
      }
    };

    fetchDrugs();
    fetchDiseases();
  }, [authState.token]);

  // Sync selectedDrugs with parent's prescriptions
  useEffect(() => {
    setSelectedDrugs(prescriptions);
  }, [prescriptions]);

  // Handle drug search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle disease search input
  const handleDiseaseSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setDiseaseSearchTerm(term);

    if (term.length > 2) {
      const filteredDiseases = allDiseases.filter((disease) =>
        disease.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filteredDiseases);
    } else {
      setSearchResults([]);
    }
  };

  // Handle adding a drug to the selected list
const handleAddDrug = (drug: any) => {
  const updatedDrugs = [...selectedDrugs, { ...drug, dosage: "" }];
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
      await handleSaveDrugPrescriptions(); // Save prescriptions
      setIsDialogOpen(false); // Close the "Add Prescription" dialog
      setIsConfirmationDialogOpen(true); // Open the "Confirm Payment" dialog
    } catch (error) {
      console.error("Failed to save prescriptions:", error);
    }
  };

  // Handle confirming payment and saving disease
  const handleConfirmPayment = async () => {
  console.log(selectedDisease)
    try {
      // Update the consultation with the selected disease
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${note_id}/`,
        {
          disease: selectedDisease,
          diagnosis:diagnosis,
          visit:visit
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );
setTimeout(() => {
            toast.success("Patient proceed to pharmacy successfully!", {
              autoClose: 1000, // Show toast for 2 seconds
              onClose: () => {               
          router.push("/departments/consultation/patients");
              },
            });
          }, 1000);
                window.location.reload(); // Refresh after the toast disappears
            setIsConfirmationDialogOpen(false); // Close the confirmation dialog
      // Optionally, you can trigger a page reload or navigation here if needed
    } catch (error) {
      console.error("Failed to save disease:", error);
    }
  };

  // Handle adding a new disease
  const handleAddDisease = async () => {
    if (!newDiseaseName) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/diseases/`,
        {
          name: newDiseaseName,
        }
      );
      setAllDiseases((prev) => [...prev, response.data]);
      setSelectedDisease(newDiseaseName);
      setIsAddDiseaseDialogOpen(false);
      setNewDiseaseName("");
    } catch (error) {
      console.error("Failed to add disease:", error);
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Cost (Ksh)</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedDrugs.map((drug: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{drug.drug_name}</TableCell>
                <TableCell>{drug.cost}</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    placeholder="Enter dosage"
                    value={drug.dosage}
                    onChange={(e) => {
                      const updatedDrugs = [...selectedDrugs];
                      updatedDrugs[index].dosage = e.target.value;
                      setSelectedDrugs(updatedDrugs);
                      setPrescriptions(updatedDrugs);
                    }}
                  />
                </TableCell>
                <TableCell>{drug.status}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDeleteDrug(index)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* "Add Prescription" Button */}
        <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
          Add Prescription
        </Button>

        {/* "Save Prescriptions" Button */}
        {selectedDrugs.length > 0 && (
          <Button onClick={handleSavePrescriptions} className="mt-4 ml-4">
            Save Drug Prescriptions
          </Button>
        )}

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

        {/* Confirmation Dialog with Disease Selection */}
        <Dialog
          open={isConfirmationDialogOpen}
          onOpenChange={setIsConfirmationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Please confirm the payment and select the disease affecting the
                patient.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>Total Amount to Pay:</strong> Ksh {totalCost}
              </p>

              {/* Disease Search and Selection */}
              <Input
                placeholder="Search diseases..."
                value={diseaseSearchTerm}
                onChange={handleDiseaseSearch}
              />
              {searchResults.length > 0 && (
                <ul className="mt-2 border rounded-lg p-2 max-h-40 overflow-y-auto">
                  {searchResults.map((disease: any, index) => (
                    <li
                      key={index}
                      className="p-2 hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedDisease(disease.name)}
                    >
                      {disease.name}
                    </li>
                  ))}
                </ul>
              )}
              {diseaseSearchTerm.length > 2 && searchResults.length === 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">No disease found.</p>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 mt-2"
                    onClick={() => setIsAddDiseaseDialogOpen(true)}
                  >
                    Add Disease
                  </Button>
                </div>
              )}

              {/* Selected Disease */}
              <Input
                placeholder="Selected Disease"
                value={selectedDisease}
                readOnly
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleConfirmPayment}>
                Confirm and Proceed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Disease Dialog */}
        <Dialog
          open={isAddDiseaseDialogOpen}
          onOpenChange={setIsAddDiseaseDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Disease</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Enter disease name"
              value={newDiseaseName}
              onChange={(e) => setNewDiseaseName(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDiseaseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={handleAddDisease}
              >
                Add Disease
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ToastContainer />
      </CardContent>
    </Card>
  );
};
