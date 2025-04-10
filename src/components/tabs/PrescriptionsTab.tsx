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
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

export const PrescriptionsTab = ({
  prescriptions,
  setPrescriptions,
  handleSaveDrugPrescriptions,
  note_id,
  visit,
  visitData,
  patientId,
}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<any[]>(prescriptions);
  const [expandedDrugs, setExpandedDrugs] = useState<Record<number, boolean>>(
    {}
  );
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
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Modify the handleAddDrug function
  const handleAddDrug = (drug: any) => {
    if (drug.quantity <= 0) {
      toast.error(`Cannot prescribe ${drug.drug_name} - Out of stock!`, {
        autoClose: 2000,
      });
      return;
    }

    // Check if drug is already prescribed
    if (selectedDrugs.some((d) => d.id === drug.id)) {
      toast.warn(`${drug.drug_name} is already prescribed`, {
        autoClose: 2000,
      });
      return;
    }

    const updatedDrugs = [
      ...selectedDrugs,
      {
        ...drug,
        dosage: "",
        prescribed_quantity: "",
        route: "",
        strength: "",
        frequency: "",
        duration: "",
      },
    ];
    setSelectedDrugs(updatedDrugs);
    setPrescriptions(updatedDrugs);
    setSearchTerm("");
    setIsDialogOpen(false);
    toast.success(`${drug.drug_name} added to prescriptions`, {
      autoClose: 1000,
    });
  };

  // Handle deleting a drug from the selected list
  const handleDeleteDrug = (index: number) => {
    const updatedDrugs = selectedDrugs.filter((_, i) => i !== index);
    setSelectedDrugs(updatedDrugs);
    setPrescriptions(updatedDrugs);
  };

  // Toggle expanded view for a drug
  const toggleExpanded = (index: number) => {
    setExpandedDrugs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle sending to pharmacy (combines save and send)
  const handleSendToPharmacy = async () => {
    // Check for out of stock drugs
    const outOfStockDrugs = selectedDrugs.filter((drug) => drug.quantity <= 0);

    if (outOfStockDrugs.length > 0) {
      toast.error(
        `Cannot send to pharmacy - ${outOfStockDrugs.length} drugs are out of stock`,
        { autoClose: 3000 }
      );
      return;
    }

    // Check for invalid quantities
    const invalidQuantity = selectedDrugs.some(
      (drug) =>
        !drug.prescribed_quantity || parseInt(drug.prescribed_quantity) <= 0
    );

    if (invalidQuantity) {
      toast.error("Please enter valid quantities for all prescriptions");
      return;
    }
    try {
      // First save the prescriptions
      await handleSaveDrugPrescriptions();

      // Then update the visit state
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

      toast.success("Prescriptions saved and patient sent to Pharmacy!", {
        autoClose: 1000,
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to process prescriptions:", error);
      toast.error("Failed to process prescriptions. Please try again.");
    }
  };

  // Filter drugs based on the search term (case insensitive)
  const filteredDrugs = searchTerm.trim()
    ? drugs.filter((drug) => drug.drug_name.toLowerCase().includes(searchTerm))
    : [];

  // Calculate the total cost of selected drugs
  const totalCost = selectedDrugs.reduce(
    (sum, drug) =>
      sum + parseInt(drug.cost) * (parseInt(drug.prescribed_quantity) || 1),
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
        <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
          Add Prescription
        </Button>

        {/* Card-based layout for selected drugs */}
        <div className="mt-6 space-y-4">
          {selectedDrugs.length > 0 ? (
            selectedDrugs.map((drug: any, index: number) => {
              const isOutOfStock = drug.quantity <= 0;
              return (
                <Card
                  key={index}
                  className={`p-4 ${isOutOfStock ? "border-destructive" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{drug.drug_name}</h3>
                      <p
                        className={`text-sm ${
                          isOutOfStock
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        Cost: Ksh {drug.cost} | Qty: {drug.quantity}
                        {isOutOfStock && (
                          <span className="ml-2 text-destructive font-bold">
                            (OUT OF STOCK)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(index)}
                      >
                        {expandedDrugs[index] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="ml-2">Options</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDrug(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Always visible fields */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Quantity*</label>
                      <Input
                        type="number"
                        value={drug.prescribed_quantity}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value);
                          if (quantity > drug.quantity) {
                            toast.error(
                              `Cannot prescribe more than available stock (${drug.quantity})`
                            );
                            return;
                          }
                          const updatedDrugs = [...selectedDrugs];
                          updatedDrugs[index].prescribed_quantity =
                            e.target.value;
                          setSelectedDrugs(updatedDrugs);
                          setPrescriptions(updatedDrugs);
                        }}
                        min="1"
                        max={drug.quantity}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Route*</label>
                      <Input
                        type="text"
                        value={drug.route}
                        onChange={(e) => {
                          const updatedDrugs = [...selectedDrugs];
                          updatedDrugs[index].route = e.target.value;
                          setSelectedDrugs(updatedDrugs);
                          setPrescriptions(updatedDrugs);
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Frequency*</label>
                      <Input
                        type="text"
                        value={drug.frequency}
                        onChange={(e) => {
                          const updatedDrugs = [...selectedDrugs];
                          updatedDrugs[index].frequency = e.target.value;
                          setSelectedDrugs(updatedDrugs);
                          setPrescriptions(updatedDrugs);
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Additional fields (toggleable) */}
                  {expandedDrugs[index] && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Strength</label>
                        <Input
                          type="text"
                          value={drug.strength}
                          onChange={(e) => {
                            const updatedDrugs = [...selectedDrugs];
                            updatedDrugs[index].strength = e.target.value;
                            setSelectedDrugs(updatedDrugs);
                            setPrescriptions(updatedDrugs);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Duration</label>
                        <Input
                          type="text"
                          value={drug.duration}
                          onChange={(e) => {
                            const updatedDrugs = [...selectedDrugs];
                            updatedDrugs[index].duration = e.target.value;
                            setSelectedDrugs(updatedDrugs);
                            setPrescriptions(updatedDrugs);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium">
                          Dosage Instructions
                        </label>
                        <Textarea
                          value={drug.dosage}
                          onChange={(e) => {
                            const updatedDrugs = [...selectedDrugs];
                            updatedDrugs[index].dosage = e.target.value;
                            setSelectedDrugs(updatedDrugs);
                            setPrescriptions(updatedDrugs);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No prescriptions added yet
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {selectedDrugs.length > 0 && (
          <div className="mt-6 flex justify-end gap-4">
            <Button
              onClick={() => setIsConfirmationDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Send to Pharmacy
            </Button>
          </div>
        )}

        {/* Table for existing prescriptions */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">
            Previously Prescribed Drugs
          </h3>
          {visitData?.consultation_data?.prescription?.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitData.consultation_data.prescription.map(
                    (drug: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {drug.drug_name}
                        </TableCell>
                        <TableCell>
                          {drug.prescribed_quantity || "N/A"}
                        </TableCell>
                        <TableCell>{drug.route || "N/A"}</TableCell>
                        <TableCell>{drug.frequency || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              drug.status === "dispensed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {drug.status || "pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No previous prescriptions found
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <Dialog
          open={isConfirmationDialogOpen}
          onOpenChange={setIsConfirmationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Pharmacy Referral</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will save the prescriptions and send the patient to the
                pharmacy.
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-medium">
                  <strong>Total Amount:</strong> Ksh {totalCost}
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSendToPharmacy}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Prescription Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Prescription</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search drugs by name..."
              value={searchTerm}
              onChange={handleSearch}
              className="mb-4"
            />

            <div className="flex-1 overflow-y-auto">
              {filteredDrugs.length > 0 ? (
                <div className="grid gap-2">
                  {filteredDrugs.map((drug, index) => {
                    const isOutOfStock = drug.quantity <= 0;
                    return (
                      <Card
                        key={index}
                        className={`p-4 transition-colors ${
                          isOutOfStock
                            ? "bg-gray-100 cursor-not-allowed"
                            : "hover:bg-accent cursor-pointer"
                        }`}
                        onClick={() => !isOutOfStock && handleAddDrug(drug)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{drug.drug_name}</h4>
                            {isOutOfStock && (
                              <Badge variant="destructive" className="mt-1">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">Ksh {drug.cost}</p>
                            <p
                              className={`text-sm ${
                                isOutOfStock
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Stock: {drug.quantity}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-8 text-muted-foreground">
                  No drugs found matching {searchTerm}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Search for drugs to prescribe
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ToastContainer />
      </CardContent>
    </Card>
  );
};
