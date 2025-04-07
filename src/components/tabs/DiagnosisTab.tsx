import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrganizationInfo from "../OrganizationInfo";

// Custom auto-resizing Textarea component
const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ value, onChange, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className="min-h-[60px] resize-none"
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export const DiagnosisTab = ({ visitData }: { visitData: any }) => {
  const { authState } = useAuth();
  const [sections, setSections] = useState<any[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [diseaseSearchTerm, setDiseaseSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("");
  const [originalDisease, setOriginalDisease] = useState(""); // Track original disease for comparison
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allDiseases, setAllDiseases] = useState<any[]>([]);
  const [isAddDiseaseDialogOpen, setIsAddDiseaseDialogOpen] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");
  const [isAddingDisease, setIsAddingDisease] = useState(false);
  const [hasEdits, setHasEdits] = useState(false); // Track if edits have been made

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
          if (response.data.disease) {
            setSelectedDisease(response.data.disease);
            setOriginalDisease(response.data.disease); // Store original value
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

  // Add this effect to filter diseases based on search term
  useEffect(() => {
    if (diseaseSearchTerm.trim() === "") {
      setSearchResults([]);
    } else {
      const filtered = allDiseases.filter((disease) =>
        disease.name.toLowerCase().includes(diseaseSearchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [diseaseSearchTerm, allDiseases]);
  // Check for edits whenever sections or disease changes
  useEffect(() => {
    const diseaseChanged = selectedDisease !== originalDisease;
    const sectionsChanged = sections.some(
      (section, index) => section.content !== sections[index]?.originalContent
    );
    setHasEdits(diseaseChanged || sectionsChanged);
  }, [sections, selectedDisease, originalDisease]);

  // Add a new section
  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      const newSection = { title: newSectionTitle, content: "" };
      setSections([...sections, newSection]);
      setNewSectionTitle("");
      setIsDialogOpen(false);
      setHasEdits(true);
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
    setHasEdits(true);
  };

  // Handle disease selection
  const handleDiseaseSelection = (diseaseName: string) => {
    setSelectedDisease(diseaseName);
    setHasEdits(true);
    setIsAddDiseaseDialogOpen(false);
  };

  // Handle adding a new disease
  const handleAddDisease = async () => {
    if (!newDiseaseName) return;
    setIsAddingDisease(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/diseases/`,
        {
          name: newDiseaseName,
        },
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      setAllDiseases((prev) => [...prev, response.data]);
      handleDiseaseSelection(newDiseaseName);
      setNewDiseaseName("");
      toast.success("Disease added successfully!", { autoClose: 1000 });
    } catch (error) {
      console.error("Failed to add disease:", error);
      toast.error("Failed to add disease. Please try again.");
    } finally {
      setIsAddingDisease(false);
    }
  };

  // Save diagnosis data to the backend
  const handleSaveDiagnosis = async () => {
    try {
      const payload = {
        diagnosis: JSON.stringify(sections),
        visit: visitData?.visit_id,
        physician: authState?.user_id,
        disease: selectedDisease,
      };

      if (isNewRecord) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/`,
          payload,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Diagnosis created successfully!", { autoClose: 1000 });
        setIsNewRecord(false);
      } else {
        await axios.put(
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

      setOriginalDisease(selectedDisease); // Update original disease after save
      setHasEdits(false); // Reset edit state
      window.location.reload();
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
              onChange={(e) => setDiseaseSearchTerm(e.target.value)}
            />
            {searchResults.length > 0 && (
              <ul className="mt-2 border rounded-lg p-2 max-h-40 overflow-y-auto">
                {searchResults.map((disease, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleDiseaseSelection(disease.name)}
                  >
                    {disease.name}
                  </li>
                ))}
              </ul>
            )}
            {diseaseSearchTerm.length > 2 && searchResults.length === 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No disease found. Would you like to add a new one?
                </p>
                <Input
                  placeholder="Enter new disease name"
                  value={newDiseaseName}
                  onChange={(e) => setNewDiseaseName(e.target.value)}
                  className="mt-2"
                />
                <Button
                  className="mt-2"
                  onClick={handleAddDisease}
                  disabled={isAddingDisease}
                >
                  {isAddingDisease ? "Adding..." : "Add New Disease"}
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
        <div className="mb-4 flex justify-between items-center">
          <div>
            <span className="font-medium">Disease: </span>
            <span
              className={
                hasEdits && selectedDisease !== originalDisease
                  ? "text-blue-600 font-semibold"
                  : ""
              }
            >
              {selectedDisease || "None selected"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-green-600 text-white dark:bg-green-600 dark:text-white hover:bg-green-700"
            onClick={() => setIsAddDiseaseDialogOpen(true)}
          >
            {selectedDisease ? "Change Disease" : "Add Disease"}
          </Button>
        </div>

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
            <AutoResizeTextarea
              value={section.content}
              onChange={(e) =>
                handleSectionContentChange(index, e.target.value)
              }
              placeholder={`Enter ${section.title} notes...`}
            />
          </div>
        ))}

        {/* Save diagnosis button */}
        <div className="flex justify-between mt-6">
          <Button
            variant={hasEdits ? "default" : "secondary"}
            onClick={handleSaveDiagnosis}
            className="w-full"
          >
            {isNewRecord
              ? "Save Diagnosis"
              : hasEdits
              ? "Save Changes"
              : "Diagnosis Saved"}
          </Button>
        </div>

        <ToastContainer />
      </CardContent>
    </Card>
  );
};
