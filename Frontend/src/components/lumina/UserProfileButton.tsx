import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { UserProfileModal } from "./UserProfileModal";

export function UserProfileButton() {
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("lumina_username") || "Guest";
    setUserName(storedName);
  }, [showProfile]);

  return (
    <>
      <div 
        onClick={() => setShowProfile(true)}
        className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-black/5 transition-all cursor-pointer group border border-transparent hover:border-border/40"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-sage flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{userName}</p>
        </div>
      </div>
      <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
