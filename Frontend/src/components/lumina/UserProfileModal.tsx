import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    joinedDate: "April 2024",
  });

  useEffect(() => {
    const username = localStorage.getItem("lumina_username") || "Guest User";
    const email = localStorage.getItem("lumina_email") || "guest@lumina.ai";
    setUserData(prev => ({ ...prev, username, email }));
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("lumina_username");
    localStorage.removeItem("lumina_email");
    onClose();
    navigate("/logout");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-md border-primary/20 shadow-2xl rounded-3xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-[#3A5F4D]/20 to-transparent p-6 pb-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-serif text-[#3A5F4D]">Profile Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              View and manage your account information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarImage src="" alt={userData.username} />
              <AvatarFallback className="bg-gradient-sage text-white text-2xl font-bold">
                {getInitials(userData.username)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">{userData.username}</h3>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-[#3A5F4D]" /> Lumina Member
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 bg-white/50">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors">
              <div className="p-2 rounded-xl bg-white shadow-sm">
                <User className="w-4 h-4 text-[#3A5F4D]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Username</p>
                <p className="text-sm font-medium truncate">{userData.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors">
              <div className="p-2 rounded-xl bg-white shadow-sm">
                <Mail className="w-4 h-4 text-[#3A5F4D]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Email Address</p>
                <p className="text-sm font-medium truncate">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors">
              <div className="p-2 rounded-xl bg-white shadow-sm">
                <Calendar className="w-4 h-4 text-[#3A5F4D]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Member Since</p>
                <p className="text-sm font-medium truncate">{userData.joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-black/5 border-t border-primary/10">
          <div className="flex w-full gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-primary/20 hover:bg-primary/5">
              Close
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
