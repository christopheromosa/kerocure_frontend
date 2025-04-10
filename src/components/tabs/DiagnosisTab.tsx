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
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Plus, X, Loader2, Check } from "lucide-react";
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
    const timer = setTimeout(() => {
      if (diseaseSearchTerm.trim() === "") {
        setSearchResults([]);
      } else {
        const filtered = allDiseases.filter((disease) =>
          disease.name.toLowerCase().includes(diseaseSearchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
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
  const handleAddDisease = async (diseaseName: string) => {
    if (!diseaseName) return;
    setIsAddingDisease(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/diseases/`,
        { name: diseaseName },
        { headers: { Authorization: `Token ${authState?.token}` } }
      );
      setAllDiseases((prev) => [...prev, response.data]);
      toast.success("Disease added successfully!", { autoClose: 1000 });
      return response.data;
    } catch (error) {
      console.error("Failed to add disease:", error);
      toast.error("Failed to add disease. Please try again.");
      throw error;
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
        <Dialog
          open={isAddDiseaseDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDiseaseSearchTerm("");
              setSearchResults([]);
            }
            setIsAddDiseaseDialogOpen(open);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Primary Diagnosis</DialogTitle>
              <DialogDescription>
                Search for existing diagnosis or add a new one
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search diagnosis..."
                    value={diseaseSearchTerm}
                    onChange={(e) => setDiseaseSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                    autoFocus
                  />
                  {diseaseSearchTerm && (
                    <button
                      onClick={() => setDiseaseSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Results */}
                {diseaseSearchTerm.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    {searchResults.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {searchResults.map((disease, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0 flex items-center"
                            onClick={() => handleDiseaseSelection(disease.name)}
                          >
                            <span className="font-medium">{disease.name}</span>
                            {disease.description && (
                              <span className="text-sm text-muted-foreground ml-2 truncate">
                                {disease.description}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex flex-col items-center justify-center space-y-3 text-center">
                          <p className="text-muted-foreground">
                            No results found for {diseaseSearchTerm}
                          </p>
                          <Button
                            onClick={() => {
                              // Automatically add the search term as new disease
                              handleDiseaseSelection(diseaseSearchTerm);
                              // Optionally save to backend
                              handleAddDisease(diseaseSearchTerm);
                            }}
                            variant="outline"
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add &quot;{diseaseSearchTerm}&quot; as new diagnosis
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Selected Disease */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <span className="font-medium">Primary Diagnosis: </span>
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
