"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";

export default function DrugManagement() {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();

  // Dispense Dialog State
  const [isDispenseDialogOpen, setIsDispenseDialogOpen] = useState(false);
  const [selectedDrugForDispense, setSelectedDrugForDispense] = useState<any>(null);
  const [quantitySold, setQuantitySold] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch drugs from the backend
  const fetchDrugs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      setDrugs(response.data);
    } catch (error) {
      console.error("Failed to fetch drugs:", error);
      toast.error("Failed to fetch drugs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  // Filter drugs based on search query and status
  const filteredDrugs = drugs.filter((drug) => {
    const matchesSearch = drug.drug_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || drug.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate results
  const totalPages = Math.ceil(filteredDrugs.length / itemsPerPage);
  const displayedDrugs = filteredDrugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle printing the drug list
  const handlePrintDrugList = () => {
    const printContent = `
      <html>
        <head>
          <title>Drug List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .header img {
              width: 100px;
              height: auto;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            .header p {
              margin: 5px 0;
              font-size: 14px;
              color: #666;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .table th, .table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <img src="/kerocureLogo-removebg-preview.png" alt="Organization Logo" />
              <h1>KEROCURE MEDICAL CENTER</h1>
              <p>PO BOX: 3192, KISII</p>
              <p>Email: Kerocure1@gmail.com | Tel: +254 725 808 100</p>
            </div>

            <!-- Drug Table -->
            <table class="table">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Cost</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredDrugs
                  .map(
                    (drug) => `
                  <tr>
                    <td>${drug.drug_name}</td>
                    <td>KSH ${drug.cost}</td>
                    <td>${drug.quantity}</td>
                    <td>${drug.status}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <!-- Footer -->
            <div class="footer">
              <p>Thank you for choosing KEROCURE MEDICAL CENTER!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drug Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Print Section */}
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/3"
          />
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="All">All</option>
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <Button
              className="bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-white"
              onClick={handlePrintDrugList}
            >
              Print Drug List
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <p className="text-center">Loading drugs...</p>}

        {/* Drug List */}
        {!isLoading && (
          <>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedDrugs.map((drug) => (
                  <TableRow key={drug.id}>
                    <TableCell>{drug.drug_name}</TableCell>
                    <TableCell>Ksh {drug.cost}</TableCell>
                    <TableCell>{drug.quantity}</TableCell>
                    <TableCell>{drug.status}</TableCell>
                    <TableCell>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => {
                          setSelectedDrugForDispense(drug);
                          setIsDispenseDialogOpen(true);
                        }}
                      >
                        Dispense
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Dispense Dialog */}
        <Dialog open={isDispenseDialogOpen} onOpenChange={setIsDispenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dispense Drug</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Drug Name: {selectedDrugForDispense?.drug_name}</p>
              <p>Quantity: {selectedDrugForDispense?.quantity}</p>
              <p>Cost: Ksh {selectedDrugForDispense?.cost}</p>
              <p>Status: {selectedDrugForDispense?.status}</p>
              <Input
                type="number"
                placeholder="Quantity Sold"
                value={quantitySold}
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  setQuantitySold(qty);
                  setTotalAmount(qty * selectedDrugForDispense?.cost);
                }}
              />
              <p>Total Amount: Ksh {totalAmount}</p>
              <Button
                onClick={async () => {
                 const newQuantity = selectedDrugForDispense.quantity - quantitySold;
                  // Update drug quantity
                  await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/drugs/${selectedDrugForDispense.id}/`,
                    {
                      ...selectedDrugForDispense,
                      quantity: newQuantity,
                       status: newQuantity <= 0 ? "Out of Stock" : "Available",
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${authState?.token}`,
                      },
                    }
                  );

                  // Create DrugSale record
                  await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/drug-sales/`,
                    {
                      drug: selectedDrugForDispense.id,
                      quantity_sold: quantitySold,
                      total_amount: totalAmount,
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${authState?.token}`,
                      },
                    }
                  );

                  toast.success("Drug dispensed successfully!");
                  fetchDrugs(); // Refresh the list
                  
                  setIsDispenseDialogOpen(false);
                }}
              >
                Complete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ToastContainer />
      </CardContent>
    </Card>
  );
}
