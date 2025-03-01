
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

interface StaffTableProps {
  staffData: Staff[];
  onResetPassword: (staff: Staff) => void;
  onEditStaff: (staff: Staff) => void;
}

export const StaffTable = ({
  staffData,
  onResetPassword,
  onEditStaff,
}: StaffTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Username</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Contact</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {staffData.map((staffMember) => (
        <TableRow key={staffMember.id}>
          <TableCell>{staffMember.username}</TableCell>
          <TableCell>
            {staffMember.first_name} {staffMember.last_name}
          </TableCell>
          <TableCell>{staffMember.role}</TableCell>
          <TableCell>{staffMember.phone_number}</TableCell>
          <TableCell className="space-x-2">
            <Button
              variant="outline"
              onClick={() => onResetPassword(staffMember)}
            >
              Reset Password
            </Button>
            <Button variant="outline" onClick={() => onEditStaff(staffMember)}>
              Edit
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
