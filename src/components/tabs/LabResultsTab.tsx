import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import axios from "axios";
import OrganizationInfo from "../OrganizationInfo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const LabResultsTab = ({
  labResults,
  visitId,
  authState,
  patientId,
}: any) => {
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);

  const handleCheckout = async () => {
    try {
      // Make the API call to update the visit state
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/${visitId}/`,
        {
          patient: patientId,
          current_state: "CONSULTATION",
          next_state: "BILLING",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Patient sent to billing successfully!");
        setIsCheckoutDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to send patient to billing:", error);
      toast.error("Failed to send patient to billing. Please try again.");
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
        {/* Lab Results List */}
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

        {/* Checkout Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => setIsCheckoutDialogOpen(true)}
          >
            Checkout to Billing
          </Button>
        </div>

        {/* Checkout Confirmation Dialog */}
        <Dialog
          open={isCheckoutDialogOpen}
          onOpenChange={setIsCheckoutDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Checkout</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to send this patient directly to billing?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCheckoutDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                onClick={handleCheckout}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
