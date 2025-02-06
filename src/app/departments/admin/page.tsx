"use client";
import LoadingPage from "@/components/loading_animation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useDashboardData } from "@/context/DashboardContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  // Mock data for demonstration
  const { data, isLoading, refetch } = useDashboardData();

  console.log(data);

  const patientsInQueue = [
    { department: "Consultation", count: data.consultationPatients },
    { department: "Laboratory", count: data.labPatients },
    { department: "Pharmacy", count: data.pharmacyPatients },
    { department: "Billing", count: data.billingPatients },
  ];



const formattedData = data.revenues.map((item) => ({
  ...item,
  formattedDate: new Date(item.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }), // Converts "2025-02-05" to "Feb 5"
}));
  return (
    <div className="p-6 space-y-6">
      {isLoading && <LoadingPage />}
      <div className="flex justify-between">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Button onClick={refetch}>Refresh data</Button>
</div>
      {/* Patients in Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Patients in Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {patientsInQueue.map((item) => (
              <Card key={item.department}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.department}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{item.count}</p>
                </CardContent>
              </Card>
            ))}
            <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Total Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">Ksh {data.billingTotalCost??0.00 }</p>
                            </CardContent>
                          </Card>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
<Card>
  <CardHeader>
    <CardTitle>Revenue per Day</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <XAxis dataKey="formattedDate" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total_cost" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>


      {/* Latest Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Billing Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visit</TableHead>
                <TableHead>Consultation</TableHead>
                <TableHead>Laboratory</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Billed By</TableHead>
                <TableHead>Recorded at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.billingRecords.map((transaction,index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.visit}</TableCell>
                  <TableCell>{transaction.consultation_cost}</TableCell>
                  <TableCell>Ksh {transaction.laboratory_cost}</TableCell>
                  <TableCell>{transaction.pharmacy_cost}</TableCell>
                  <TableCell>{transaction.total_cost}</TableCell>
                  <TableCell>{transaction.billed_by}</TableCell>
                   <TableCell>{transaction.recorded_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
