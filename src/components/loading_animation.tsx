import { Loader2 } from "lucide-react"; // Import a spinner icon from Lucide React

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />{" "}
        {/* Spinner */}
        <p className="text-lg font-medium text-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
