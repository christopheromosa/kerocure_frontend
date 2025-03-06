import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import OrganizationInfo from "../OrganizationInfo";

export const LabResultsTab = ({ labResults }: any) => {
  return (
    <Card>
      <CardHeader className="mt-0 pt-0">
        <CardTitle>
          <OrganizationInfo />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {labResults?.length > 0 ? (
          <ul>
            {labResults.map((test: any, index: number) => (
              <li key={index} className="mb-4">
                <div className="border rounded-lg p-4">
                  {Object.entries(test).map(([testName, testResult]) => (
                    <p key={testName}>
                      <strong>{testName}:</strong> {testResult as string}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No lab results available.</p>
        )}
      </CardContent>
    </Card>
  );
};
