import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import OrganizationInfo from "../OrganizationInfo";
import axios from "axios";

export const DiagnosisTab = ({
  diagnosis,
  setDiagnosis,
  handleSaveDiagnosis,
  isDiagnosisSaved,
}: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allDiseases, setAllDiseases] = useState<any[]>([]);
  const [isAddDiseaseDialogOpen, setIsAddDiseaseDialogOpen] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");

  // Fetch all diseases on page load
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/diseases/`
        );
        setAllDiseases(response.data);
      } catch (error) {
        console.error("Failed to fetch diseases:", error);
      }
    };
    fetchDiseases();
  }, []);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 2) {
      const filteredDiseases = allDiseases.filter((disease) =>
        disease.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filteredDiseases);
    } else {
      setSearchResults([]);
    }
  };

  // Handle disease selection
  const handleSelectDisease = (disease: any) => {
    setSelectedDisease(disease.name);
    setDiagnosis((prev: any) => `${prev}\n- ${disease.name}`);
    setSearchResults([]);
    setSearchTerm("");
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
      setDiagnosis((prev: any) => `${prev}\n- ${newDiseaseName}`);
      setIsAddDiseaseDialogOpen(false);
      setNewDiseaseName("");
    } catch (error) {
      console.error("Failed to add disease:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="mt-0 pt-0">
        <CardTitle>
          <OrganizationInfo />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MDEditor
          value={diagnosis}
          onChange={(value) => setDiagnosis(value ?? "")}
          preview="edit"
        />

        {/* Search input */}
        <div className="mt-4">
          <Input
            placeholder="Search diseases..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchResults.length > 0 && (
            <ul className="mt-2 border rounded-lg p-2 max-h-40 overflow-y-auto">
              {searchResults.map((disease: any, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectDisease(disease)}
                >
                  {disease.name}
                </li>
              ))}
            </ul>
          )}
          {searchTerm.length > 2 && searchResults.length === 0 && (
            <Button
              variant="link"
              className="mt-2"
              onClick={() => setIsAddDiseaseDialogOpen(true)}
            >
              Add Disease: {searchTerm}
            </Button>
          )}
        </div>

        {/* Selected disease input */}
        <div className="mt-4">
          <Input
            placeholder="Selected Disease"
            value={selectedDisease}
            readOnly
          />
        </div>

        {/* Save diagnosis button */}
        <Button
          className="mt-4"
          onClick={handleSaveDiagnosis}
          disabled={isDiagnosisSaved}
        >
          {isDiagnosisSaved ? "Diagnosis Saved" : "Save Diagnosis"}
        </Button>
      </CardContent>

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
            <Button onClick={handleAddDisease}>Add Disease</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
