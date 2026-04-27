import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a logout process
    const timer = setTimeout(() => {
      toast.success("You have been logged out.");
      navigate("/login");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 p-4">
      <Card className="w-full max-w-sm shadow-lg border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Logging Out</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Please wait while we log you out...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;
