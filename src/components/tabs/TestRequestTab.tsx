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
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { ToastContainer, toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import { Input } from "@/components/ui/input";
import OrganizationInfo from "../OrganizationInfo";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export const TestRequestTab = ({
  testRequests,
  setTestRequests,
  handleSaveTestRequests,
  visitData,
}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [labTests, setLabTests] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<any[]>(testRequests);
  const { authState } = useAuth();
  const router = useRouter();

  // Fetch lab tests on component mount
  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/labtests/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        setLabTests(response.data);
      } catch (error) {
        console.error("Failed to fetch lab tests:", error);
      }
    };

    fetchLabTests();
  }, [authState?.token]);

  // Sync selectedTests with parent's testRequests
  useEffect(() => {
    setSelectedTests(testRequests);
  }, [testRequests]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setSearchTerm("");
    }
  }, [isDialogOpen]);

  // Handle search input (case insensitive)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Handle adding a test to the selected list
  const handleAddTest = (test: any) => {
    const testWithAdministered = { ...test, administered: false };
    const updatedTests = [...selectedTests, testWithAdministered];
    setSelectedTests(updatedTests);
    setTestRequests(updatedTests);
    setIsDialogOpen(false); // Close dialog after adding
  };

  // Handle deleting a test from the selected list
  const handleDeleteTest = (index: number) => {
    const updatedTests = selectedTests.filter((_, i) => i !== index);
    setSelectedTests(updatedTests);
    setTestRequests(updatedTests);
  };

  // Handle saving test requests
  const handleSaveTests = () => {
    setIsConfirmationDialogOpen(true);
  };

  // Handle confirming payment
  const handleConfirmPayment = () => {
    console.log("Payment confirmed for tests:", selectedTests);
    handleSaveTestRequests();
    setTimeout(() => {
      toast.success("Patient proceed to consultation successfully!", {
        autoClose: 1000,
        onClose: () => {
          router.push("/departments/consultation/patients");
        },
      });
    }, 1000);
    window.location.reload();
    setIsConfirmationDialogOpen(false);
  };

  // Filter lab tests based on the search term (case insensitive)
  const filteredTests = searchTerm.trim()
    ? labTests.filter((test) => test.service.toLowerCase().includes(searchTerm))
    : [];

  // Calculate the total cost of selected tests
  const totalCost = selectedTests.reduce(
    (sum, test) => sum + parseInt(test.cost),
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
        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setIsDialogOpen(true)}>Add Test</Button>
        </div>

        {/* Current Test Requests */}
        {selectedTests.length > 0 ? (
          <div className="border rounded-lg mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Cost (Ksh)</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTests.map((test: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {test.service}
                    </TableCell>
                    <TableCell>{test.cost}</TableCell>
                    <TableCell>{test.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant={test.administered ? "default" : "secondary"}
                      >
                        {test.administered ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTest(index)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-4 border-t">
              <p className="text-right font-medium">
                Total Cost: Ksh {totalCost}
              </p>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 m-2"
              onClick={handleSaveTests}
            >
              Save Test Requests
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No tests added yet
          </div>
        )}

        {/* Previously Ordered Tests */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Previously Ordered Tests</h3>
          {visitData?.consultation_data?.lab_test_ordered?.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Cost (Ksh)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitData.consultation_data.lab_test_ordered.map(
                    (test: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{test.service || "N/A"}</TableCell>
                        <TableCell>{test.cost || "N/A"}</TableCell>
                        <TableCell>{test.duration || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              test.administered ? "default" : "secondary"
                            }
                          >
                            {test.administered ? "Completed" : "Pending"}
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
              No previous test orders found
            </div>
          )}
        </div>

        {/* Add Test Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Laboratory Test</DialogTitle>
              <DialogDescription>
                Search and select tests to add to this request
              </DialogDescription>
            </DialogHeader>

            <Input
              placeholder="Search tests by name..."
              value={searchTerm}
              onChange={handleSearch}
              className="mb-4"
            />

            <div className="flex-1 overflow-y-auto">
              {filteredTests.length > 0 ? (
                <div className="grid gap-2">
                  {filteredTests.map((test, index) => (
                    <Card
                      key={index}
                      className="p-4 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleAddTest(test)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{test.service}</h4>
                          <p className="text-sm text-muted-foreground">
                            {test.description || "No description available"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Ksh {test.cost}</p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {test.duration}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tests found matching {searchTerm}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Search for tests to add to this request
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

        {/* Confirmation Dialog */}
        <Dialog
          open={isConfirmationDialogOpen}
          onOpenChange={setIsConfirmationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Test Request</DialogTitle>
              <DialogDescription>
                This will save the test requests and prepare them for
                processing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-medium">
                  <strong>Total Amount:</strong> Ksh {totalCost}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedTests.length} test(s) selected
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleConfirmPayment}>
                Confirm and Proceed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ToastContainer />
      </CardContent>
    </Card>
  );
};
