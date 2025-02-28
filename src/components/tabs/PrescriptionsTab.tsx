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
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import OrganizationInfo from "../OrganizationInfo";
import axios from "axios";
import { Input } from "../ui/input";

export const PrescriptionsTab = ({ prescriptions, setPrescriptions }: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/drugs/`
        );
        setDrugs(response.data);
      } catch (error) {
        console.error("Failed to fetch drugs:", error);
      }
    };

    fetchDrugs();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddDrug = (drug: any) => {
    setSelectedDrugs([...selectedDrugs, drug]);
    setSearchTerm("");
  };

  const handleDeleteDrug = (index: number) => {
    setSelectedDrugs(selectedDrugs.filter((_, i) => i !== index));
  };

  const handleSavePrescriptions = () => {
    setPrescriptions(selectedDrugs);
    setIsDialogOpen(false);
  };

  const filteredDrugs = drugs.filter((drug) =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="mt-0 pt-0">
        <CardTitle>
          <OrganizationInfo />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prescriptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{prescription.medication}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleDeleteDrug(index)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Button onClick={() => setIsDialogOpen(true)}>
            Add Prescription
          </Button>
        )}
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
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddDrug(drug)}
                  >
                    {drug.name} - {drug.dosage}
                  </li>
                ))}
              </ul>
            )}
            <DialogFooter>
              <Button onClick={handleSavePrescriptions}>Save</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
