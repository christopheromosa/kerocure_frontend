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

export const TestRequestTab = ({
  testRequests,
  setTestRequests,
  handleSaveTestRequests,
  visitData
}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [labTests, setLabTests] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<any[]>(testRequests); // Initialize with existing test requests
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

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

 // Handle adding a test to the selected list
  const handleAddTest = (test: any) => {
    // Add the administered field with a default value of false
    const testWithAdministered = { ...test, administered: false };
    
    // Update the selectedTests array with the new test object
    const updatedTests = [...selectedTests, testWithAdministered];
    
    // Update the state with the new array
    setSelectedTests(updatedTests);
    setTestRequests(updatedTests); // Update parent's state
    
    // Clear the search term
    setSearchTerm("");
  };

  // Handle deleting a test from the selected list
  const handleDeleteTest = (index: number) => {
    const updatedTests = selectedTests.filter((_, i) => i !== index);
    setSelectedTests(updatedTests);
    setTestRequests(updatedTests); // Update parent's state
  };

  // Handle saving test requests
  const handleSaveTests = () => {
    handleSaveTestRequests(); // Call the save function from the parent
    setIsDialogOpen(false); // Close the "Add Test" dialog
    setIsConfirmationDialogOpen(true); // Open the "Confirm Payment" dialog
  };

  // Handle confirming payment
  const handleConfirmPayment = () => {
    console.log("Payment confirmed for tests:", selectedTests);
    setTimeout(() => {
      toast.success("Patient proceed to consultation successfully!", {
        autoClose: 1000, // Show toast for 2 seconds
        onClose: () => {
          router.push("/departments/consultation/patients");
        },
      });
    }, 1000);
    window.location.reload();
    setIsConfirmationDialogOpen(false); // Close the confirmation dialog
  };

  // Filter lab tests based on the search term
  const filteredTests = searchTerm.trim()
    ? labTests.filter((test) =>
        test.service.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Calculate the total cost of selected tests
  const totalCost = selectedTests.reduce(
    (sum, test) => sum + parseInt(test.cost),
    0
  );

console.log(visitData?.consultation_data.lab_test_ordered)
  return (
    <Card>
      <CardHeader className="mt-0 pt-0">
        <CardTitle>
          <OrganizationInfo />
        </CardTitle>
      </CardHeader>
      <CardContent>
       {/* "Add Test" Button */}
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="mt-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white"
        >
          Add Test
        </Button>
        {/* Table to display selected tests */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Cost (Ksh)</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedTests.map((test: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{test.service}</TableCell>
                <TableCell>{test.cost}</TableCell>
                <TableCell>{test.duration}</TableCell>
                <TableCell>
                  <Button
                    className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-white"
                    onClick={() => handleDeleteTest(index)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

       

        {/* "Save Test Requests" Button */}
        {selectedTests.length > 0 && (
          <Button onClick={handleSaveTests} className="mt-4 ml-4">
            Save Test Requests
          </Button>
          
        )}

{/* Table for existing lab tests (read-only) */}
        {visitData?.consultation_data?.lab_test_ordered?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Previously Ordered Tests</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Cost (Ksh)</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitData.consultation_data.lab_test_ordered.map(
                  (test: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{test.service}</TableCell>
                      <TableCell>{test.cost}</TableCell>
                      <TableCell>{test.duration}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* "Add Test" Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Test</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search lab tests..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {filteredTests.length > 0 && (
              <ul className="mt-2 border rounded-lg p-2 max-h-40 overflow-y-auto">
                {filteredTests.map((test, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => handleAddTest(test)}
                  >
                    <div className="flex justify-between">
                      <span>{test.service}</span>
                      <span>Ksh {test.cost}</span>
                      <span>{test.duration}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* "Confirm Payment" Dialog */}
        <Dialog
          open={isConfirmationDialogOpen}
          onOpenChange={setIsConfirmationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Please confirm the payment before proceeding.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>Total Amount to Pay:</strong> Ksh {totalCost}
              </p>
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
