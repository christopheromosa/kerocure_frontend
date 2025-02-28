import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
  const [searchResults, setSearchResults] = useState([]);

  // Fetch diseases from the backend API
  const handleSearch = async (e: any) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 2) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/diseases?search=${term}`
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error("Failed to fetch diseases:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectDisease = (disease: any) => {
    setSelectedDisease(disease);
    setDiagnosis((prev: any) => `${prev}\n- ${disease}`);
    setSearchResults([]);
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

        {/* Search input moved below the editor */}
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
                  onClick={() => handleSelectDisease(disease.name)}
                >
                  {disease.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Input for selected disease */}
        <div className="mt-4">
          <Input
            placeholder="Selected Disease"
            value={selectedDisease}
            readOnly
          />
        </div>


        <Button
          className="mt-4"
          onClick={handleSaveDiagnosis}
          disabled={isDiagnosisSaved}
        >
          {isDiagnosisSaved ? "Diagnosis Saved" : "Save Diagnosis"}
        </Button>
      </CardContent>
    </Card>
  );
};
