import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/";
  };

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-background px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger />
        <h2 className="text-sm sm:text-lg font-semibold truncate">Loan Management</h2>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
        <LogOut className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </header>
  );
}
