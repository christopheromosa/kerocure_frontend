"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Staff } from "@/app/departments/admin/staff/page";
import { Badge } from "@/components/ui/badge"; // For displaying roles as chips
import { Input } from "@/components/ui/input"; // For search functionality
import { useState } from "react";

interface StaffTableProps {
  staffData: Staff[];
  onResetPassword: (staff: Staff) => void;
  onEditStaff: (staff: Staff) => void;
}

export const StaffTable = ({
  staffData,
  onResetPassword,
  onEditStaff,
}: StaffTableProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");

  // Filter staff data based on search query and role
  const filteredStaff = staffData.filter((staffMember) => {
    const matchesSearch =
      (staffMember.username?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      staffMember.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole
      ? staffMember.roles.includes(filterRole)
      : true;

    return matchesSearch && matchesRole;
  });

  console.log(staffData);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Roles</option>
          <option value="Triage">Triage</option>
          <option value="Doctor">Doctor</option>
          <option value="Lab Technician">Lab Technician</option>
          <option value="Pharmacist">Pharmacist</option>
          <option value="Administrator">Administrator</option>
          <option value="Billing">Billing</option>
        </select>
      </div>

      {/* Staff Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Is Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStaff.map((staffMember) => (
            <TableRow key={staffMember.id}>
              <TableCell>{staffMember.username}</TableCell>
              <TableCell>
                {staffMember.first_name} {staffMember.last_name}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {staffMember.roles.map((role, index) => (
                    <Badge key={index} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{staffMember.phone_number}</TableCell>
              <TableCell>
                <Badge className={`${staffMember.is_active ? "bg-blue-700" : "bg-red-700"}`}>
                  {staffMember.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onResetPassword(staffMember)}
                >
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onEditStaff(staffMember)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
