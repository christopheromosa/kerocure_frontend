// "use client";
// import * as React from "react";
// import { useState, useEffect } from "react";
// import { DataGrid, GridToolbar} from "@mui/x-data-grid";
// import { Button, TextField, Box } from "@mui/material";
// import { saveAs } from "file-saver";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

// interface DataTableProps {
//   columns: { field: string; headerName: string; width?: number }[];
//   data: any[]; // Function to fetch data
//   title: string; // Used for PDF export
//   dateField?: string; // Optional: The field to use for date filtering
// }

// // Fetch data from an API
// // const fetchData = async () => {
// //   const response = await fetch("https://api.example.com/patient-records"); // Replace with your API endpoint
// //   const data = await response.json();
// //   return data;
// // };

// // const columns = [
// //   { field: "id", headerName: "ID", width: 90 },
// //   { field: "patient_name", headerName: "Patient Name", width: 150 },
// //   { field: "staff_name", headerName: "Staff Name", width: 150 },
// //   { field: "diagnosis", headerName: "Diagnosis", width: 200 },
// //   { field: "disease", headerName: "Disease", width: 150 },
// //   { field: "prescription", headerName: "Prescription", width: 200 },
// //   { field: "lab_tests_ordered", headerName: "Lab Tests Ordered", width: 200 },
// //   { field: "total_cost", headerName: "Total Cost", width: 120 },
// //   { field: "recorded_at", headerName: "Recorded At", width: 180 },
// //   { field: "visit", headerName: "Visit", width: 90 },
// //   { field: "triage", headerName: "Triage", width: 90 },
// //   { field: "physician", headerName: "Physician", width: 120 },
// // ];

// // const exportToExcel = (rows: any) => {
// //   const header = columns.map((col) => col.headerName);
// //   const data = rows.map((row: any) => columns.map((col) => row[col.field]));
// //   const csvContent = [header, ...data].map((row) => row.join(",")).join("\n");
// //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
// //   saveAs(blob, "patient_records.csv");
// // };

// // const exportToPDF = (rows: any) => {
// //   const doc = new jsPDF();

// //   // Add organization details
// //   doc.setFontSize(18);
// //   doc.setFont("helvetica", "bold");
// //   doc.text("KEROCURE MEDICAL CENTER", 15, 20);

// //   doc.setFontSize(12);
// //   doc.setFont("helvetica", "normal");
// //   doc.text("PO BOX: 3172 - 4255, KISII", 15, 30);
// //   doc.text("Email: Kerocure1@gmail.com", 15, 35);
// //   doc.text("Tel: +254711111111", 15, 40);

// //   // Add a logo (if you have the image URL or base64 data)
// //   const logoUrl = "/kerocureLogo-removebg-preview.png"; // Replace with the actual path or URL
// //   const img = new Image();
// //   img.src = logoUrl;
// //   img.onload = () => {
// //     doc.addImage(img, "PNG", 150, 10, 50, 25); // Adjust position and size as needed

// //     // Add the table
// //     autoTable(doc, {
// //       startY: 50, // Start the table below the organization details
// //       head: [columns.map((col) => col.headerName)],
// //       body: rows.map((row: any) => columns.map((col) => row[col.field])),
// //     });

// //     // Save the PDF
// //     doc.save("patient_records.pdf");
// //   };
// // };

// // export default function PatientTable() {
// export const DataTable: React.FC<DataTableProps> = ({
//   columns,
//   data,
//   title,
//   dateField,

// }) => {
//   //   const [rows, setRows] = useState([]);
//   //   const [filteredRows, setFilteredRows] = useState([]);
//   //   const [startDate, setStartDate] = useState("");
//   //   const [endDate, setEndDate] = useState("");
//   const [rows, setRows] = useState<any[]>(data);
//   const [filteredRows, setFilteredRows] = useState<any[]>([]);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   // Fetch data on component mount
//   //   useEffect(() => {
//   //     fetchData().then((data) => {
//   //       setRows(data);
//   //       setFilteredRows(data);
//   //     });
//   //   }, []);
//   //   useEffect(() => {
//   //     fetchData().then((data) => {
//   //       setRows(data);
//   //       setFilteredRows(data);
//   //     });
//   //   }, [fetchData]);

//   // Apply date range filter
//   //   const applyDateFilter = () => {
//   //     const filtered = rows.filter((row: any) => {
//   //       const recordedAt = new Date(row.recorded_at);
//   //       const start = new Date(startDate);
//   //       const end = new Date(endDate);
//   //       return recordedAt >= start && recordedAt <= end;
//   //     });
//   //     setFilteredRows(filtered);
//   //   };

//   const applyDateFilter = () => {
//     if (!dateField) return;
//     const filtered = rows.filter((row) => {
//       const recordedAt = new Date(row[dateField]);
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       return recordedAt >= start && recordedAt <= end;
//     });
//     setFilteredRows(filtered);
//   };

//   // Reset date filter
//   //   const resetDateFilter = () => {
//   //     setFilteredRows(rows);
//   //     setStartDate("");
//   //     setEndDate("");
//   //   };
//   const resetDateFilter = () => {
//     setFilteredRows(rows);
//     setStartDate("");
//     setEndDate("");
//   };
//   const exportToExcel = () => {
//     const header = columns.map((col) => col.headerName);
//     const data = filteredRows.map((row) =>
//       columns.map((col) => row[col.field])
//     );
//     const csvContent = [header, ...data].map((row) => row.join(",")).join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     saveAs(blob, `${title.replace(/\s+/g, "_").toLowerCase()}.csv`);
//   };

//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(18).text(title, 15, 20);
//     doc.setFontSize(12).text("Generated Report", 15, 30);
//      doc.setFontSize(18);
//   doc.setFont("helvetica", "bold");
//   doc.text("KEROCURE MEDICAL CENTER", 15, 20);

//   doc.setFontSize(12);
//   doc.setFont("helvetica", "normal");
//   doc.text("PO BOX: 3172 - 4255, KISII", 15, 30);
//   doc.text("Email: Kerocure1@gmail.com", 15, 35);
//   doc.text("Tel: +254711111111", 15, 40);

//   // Add a logo (if you have the image URL or base64 data)
//   const logoUrl = "/kerocureLogo-removebg-preview.png"; // Replace with the actual path or URL
//   const img = new Image();
//   img.src = logoUrl;
//   img.onload = () => {
//     doc.addImage(img, "PNG", 150, 10, 50, 25); // Adjust position and size as needed
//   }
//     autoTable(doc, {
//       startY: 40,
//       head: [columns.map((col) => col.headerName)],
//       body: filteredRows.map((row) => columns.map((col) => row[col.field])),
//     });

//     doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
//   };

//   //   return (
//   //     <Box sx={{ height: 500, width: "100%", padding: 2 }}>
//   //       {/* Date Range Filter */}
//   //       <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
//   //         <TextField
//   //           label="Start Date"
//   //           type="date"
//   //           value={startDate}
//   //           onChange={(e) => setStartDate(e.target.value)}
//   //           InputLabelProps={{ shrink: true }}
//   //           sx={{ width: 200 }}
//   //         />
//   //         <TextField
//   //           label="End Date"
//   //           type="date"
//   //           value={endDate}
//   //           onChange={(e) => setEndDate(e.target.value)}
//   //           InputLabelProps={{ shrink: true }}
//   //           sx={{ width: 200 }}
//   //         />
//   //         <Button onClick={applyDateFilter} variant="contained">
//   //           Apply Filter
//   //         </Button>
//   //         <Button onClick={resetDateFilter} variant="outlined">
//   //           Reset Filter
//   //         </Button>
//   //       </Box>

//   //       {/* Data Grid */}
//   //       <DataGrid
//   //         rows={filteredRows}
//   //         columns={columns}
//   //         slots={{ toolbar: GridToolbar }}
//   //         pageSizeOptions={[5]}
//   //         checkboxSelection
//   //         sx={{
//   //           backgroundColor: "#f5f5f5",
//   //           "& .MuiDataGrid-columnHeader": {
//   //             backgroundColor: "#1976d2",
//   //             color: "#fff",
//   //           },
//   //           "& .MuiDataGrid-cell": {
//   //             borderBottom: "1px solid #ddd",
//   //           },
//   //         }}
//   //       />

//   //       {/* Export Buttons */}
//   //       <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
//   //         <Button onClick={() => exportToExcel(filteredRows)} variant="contained">
//   //           Export to Excel
//   //         </Button>
//   //         <Button onClick={() => exportToPDF(filteredRows)} variant="contained">
//   //           Export to PDF
//   //         </Button>
//   //       </Box>
//   //     </Box>
//   //   );

//   return (
//     <Box sx={{ height: 400, width: "100%", padding: 2 }}>
//       {dateField && (
//         <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
//           <TextField
//             label="Start Date"
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             InputLabelProps={{ shrink: true }}
//             sx={{ width: 200 }}
//           />
//           <TextField
//             label="End Date"
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             InputLabelProps={{ shrink: true }}
//             sx={{ width: 200 }}
//           />
//           <Button onClick={applyDateFilter} variant="contained">
//             Apply Filter
//           </Button>
//           <Button onClick={resetDateFilter} variant="outlined">
//             Reset Filter
//           </Button>
//         </Box>
//       )}

//       <DataGrid
//         rows={filteredRows}
//         columns={columns}
//         slots={{ toolbar: GridToolbar }}
//         pageSizeOptions={[5, 10, 20]}
//         checkboxSelection
//         sx={{
//           backgroundColor: "#f5f5f5",
//           "& .MuiDataGrid-columnHeader": {
//             backgroundColor: "#1976d2",
//             color: "#fff",
//           },
//           "& .MuiDataGrid-cell": { borderBottom: "1px solid #ddd" },
//         }}
//       />

//       <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
//         <Button onClick={exportToExcel} variant="contained">
//           Export to Excel
//         </Button>
//         <Button onClick={exportToPDF} variant="contained">
//           Export to PDF
//         </Button>
//       </Box>
//     </Box>
//   );
// };
