import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react"; // Import a copy icon for copying credentials

interface ResponsePopupProps {
  responseData: { username: string; password: string };
  onClose: () => void;
}

const ResponsePopup = ({ responseData, onClose }: ResponsePopupProps) => {
  // Function to copy credentials to clipboard
  const copyCredentials = () => {
    const credentials = `Username: ${responseData.username}\nPassword: ${responseData.password}`;
    navigator.clipboard.writeText(credentials).then(() => {
      alert("Credentials copied to clipboard!");
    });
  };

  return (
    <Dialog open={!!responseData} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Created Successfully</DialogTitle>
          <DialogDescription>
            Here are the login credentials for the new staff member:
          </DialogDescription>
        </DialogHeader>

        {/* Display Username and Password */}
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Username</p>
            <div className="flex items-center justify-between p-2 border rounded-md">
              <span>{responseData.username}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigator.clipboard.writeText(responseData.username)
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Password</p>
            <div className="flex items-center justify-between p-2 border rounded-md">
              <span>{responseData.password}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigator.clipboard.writeText(responseData.password)
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Copy All Credentials Button */}
        <Button onClick={copyCredentials} className="w-full mt-4">
          <Copy className="mr-2 h-4 w-4" />
          Copy All Credentials
        </Button>

        {/* Close Button */}
        <Button onClick={onClose} className="w-full mt-2" variant="outline">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ResponsePopup;
