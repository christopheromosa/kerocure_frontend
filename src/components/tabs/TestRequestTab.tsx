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
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import { Input } from "@/components/ui/input";
import OrganizationInfo from "../OrganizationInfo";

export const TestRequestTab = ({ testRequests, setTestRequests }: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [labTests, setLabTests] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<any[]>([]);

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/labtests/`
        );
        setLabTests(response.data);
      } catch (error) {
        console.error("Failed to fetch lab tests:", error);
      }
    };

    fetchLabTests();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddTest = (test: any) => {
    setSelectedTests([...selectedTests, test]);
    setSearchTerm("");
  };

  const handleDeleteTest = (index: number) => {
    setSelectedTests(selectedTests.filter((_, i) => i !== index));
  };

  const handleSaveTests = () => {
    setTestRequests(selectedTests);
    setIsDialogOpen(false);
  };

  const filteredTests = labTests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="mt-0 pt-0">
        <CardTitle>
          <OrganizationInfo />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {testRequests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testRequests.map((test: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleDeleteTest(index)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Button onClick={() => setIsDialogOpen(true)}>Add Test</Button>
        )}
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
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddTest(test)}
                  >
                    {test.name} - {test.duration}
                  </li>
                ))}
              </ul>
            )}
            <DialogFooter>
              <Button onClick={handleSaveTests}>Save</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
