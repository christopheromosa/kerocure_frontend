import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrganizationInfo from "../OrganizationInfo";

export const DiagnosisTab = ({ visitData }: { visitData: any }) => {
  const { authState } = useAuth();
  const [sections, setSections] = useState<any[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [diseaseSearchTerm, setDiseaseSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allDiseases, setAllDiseases] = useState<any[]>([]);
  const [isAddDiseaseDialogOpen, setIsAddDiseaseDialogOpen] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");

  // Fetch diagnosis data and diseases on component mount
  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        if (visitData?.consultation_data?.note_id) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
            {
              headers: {
                Authorization: `Token ${authState?.token}`,
              },
            }
          );
          if (response.data.diagnosis) {
            const diagnosisData = JSON.parse(response.data.diagnosis);
            setSections(diagnosisData);
            setIsNewRecord(false);
          }
        } else {
          setSections([]);
          setIsNewRecord(true);
        }
      } catch (error) {
        console.error("Failed to fetch diagnosis:", error);
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

    if (visitData?.visit_id) {
      fetchDiagnosis();
      fetchDiseases();
    }
  }, [visitData, authState.token]);

  // Add a new section
  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      const newSection = { title: newSectionTitle, content: "" };
      setSections([...sections, newSection]);
      setNewSectionTitle("");
      setIsDialogOpen(false);
    }
  };

  // Update the content of a section
  const handleSectionContentChange = (index: number, content: string) => {
    const updatedSections = [...sections];
    updatedSections[index].content = content;
    setSections(updatedSections);
  };

  // Delete a section
  const handleDeleteSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);
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

  // Save diagnosis data to the backend
  const handleSaveDiagnosis = async () => {
    try {
      const payload = {
        diagnosis: JSON.stringify(sections),
        visit: visitData?.visit_id,
        physician: authState?.user_id,
        disease: selectedDisease, // Include the selected disease
      };

      if (isNewRecord) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/`,
          payload,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Diagnosis created successfully!", { autoClose: 1000 });
        window.location.reload();
        setIsNewRecord(false);
      } else {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
          payload,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Diagnosis updated successfully!", { autoClose: 1000 });
      }
    } catch (error) {
      console.error("Failed to save diagnosis:", error);
      toast.error("Failed to save diagnosis. Please try again.");
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
        
        {/* Disease Search and Selection Dialog */}
        <Dialog
          open={isAddDiseaseDialogOpen}
          onOpenChange={setIsAddDiseaseDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Disease</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search diseases..."
              value={diseaseSearchTerm}
              onChange={handleDiseaseSearch}
            />
            {searchResults.length > 0 && (
              <ul className="mt-2 border rounded-lg p-2 max-h-40 overflow-y-auto">
                {searchResults.map((disease, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedDisease(disease.name);
                      setIsAddDiseaseDialogOpen(false);
                    }}
                  >
                    {disease.name}
                  </li>
                ))}
              </ul>
            )}
            {diseaseSearchTerm.length > 2 && searchResults.length === 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">No disease found.</p>
                <Input
                  placeholder="Enter new disease name"
                  value={newDiseaseName}
                  onChange={(e) => setNewDiseaseName(e.target.value)}
                  className="mt-2"
                />
                <Button
                  className="mt-2"
                  onClick={handleAddDisease}
                >
                  Add New Disease
                </Button>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDiseaseDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Selected Disease */}
        {selectedDisease && (
          <div className="mb-4">
            <strong>Selected Disease:</strong> {selectedDisease}
          </div>
        )}

        {/* Dialog for adding new sections */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">Add New Section</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Section Title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
            />
            <Button onClick={handleAddSection}>Add Section</Button>
          </DialogContent>
        </Dialog>

        {/* Render sections */}
        {sections.map((section, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteSection(index)}
              >
                Delete
              </Button>
            </div>
            <Textarea
              value={section.content}
              onChange={(e) => handleSectionContentChange(index, e.target.value)}
              placeholder={`Enter ${section.title} notes...`}
            />
          </div>
        ))}

        {/* Save diagnosis button */}
        <Button onClick={handleSaveDiagnosis} className="mt-4 mr-4">
          {isNewRecord ? "Save Diagnosis" : "Update Diagnosis"}
        </Button>
        {/* Button to Add Disease */}
                <Button
                  className="mb-4"
                  onClick={() => setIsAddDiseaseDialogOpen(true)}
                >
                  Add Disease
                </Button>
        
        <ToastContainer />
      </CardContent>
    </Card>
  );
};
