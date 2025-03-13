import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import OrganizationInfo from "../OrganizationInfo";

export const DiagnosisTab = ({
  diagnosis,
  setDiagnosis,
  handleSaveDiagnosis,
  isDiagnosisSaved,
  setIsDiagnosisSaved,
}: any) => {
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
          onChange={(value) => {
            setDiagnosis(value ?? "");
            setIsDiagnosisSaved(false);
          }}
          preview="edit"
        />

        {/* Save diagnosis button */}
        <Button
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white mt-4"
          onClick={handleSaveDiagnosis}
          disabled={isDiagnosisSaved}
        >
          {isDiagnosisSaved ? "Diagnosis Saved" : "Save Diagnosis"}
        </Button>
      </CardContent>
    </Card>
  );
};
