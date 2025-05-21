import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  GameControllerIcon, 
  TradeIcon, 
  CodeIcon, 
  HistoryIcon 
} from "@/components/PixelIcons";
import UserAvatar from "@/components/UserAvatar";
import { PixelButton } from "@/components/ui/pixel-button";
import { formatCurrency } from "@/lib/utils";
import { LogOut, ChevronDown, ChevronUp, Settings } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const navLinks = [
    { path: "/", icon: <GameControllerIcon />, text: "Dashboard" },
    { path: "/create-room", icon: <TradeIcon />, text: "Tạo Giao Dịch" },
    { path: "/join-room", icon: <CodeIcon />, text: "Tham Gia Giao Dịch" },
    { path: "/history", icon: <HistoryIcon />, text: "Lịch Sử Giao Dịch" },
    { path: "/settings", icon: <Settings size={20} />, text: "Cài Đặt" }
  ];

  return (
    <div className="bg-dark w-full md:w-64 p-4 border-r-2 border-primary/30">
      <div className="flex items-center justify-between md:justify-center mb-6">
        <h1 className="font-pixel text-primary text-lg">PIXELStrade</h1>
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>
      
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="mb-6">
          <div className="bg-primary/10 rounded-lg p-3 flex items-center">
            <UserAvatar username={user.username} className="w-10 h-10" />
            <div className="ml-3">
              <p className="text-light font-medium">{user.displayName}</p>
              <p className="text-xs text-gray-400">{formatCurrency(user.balance)}</p>
            </div>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <a
                className={`flex items-center px-3 py-2 rounded-md ${
                  location === link.path
                    ? "bg-primary/20 text-light"
                    : "text-light hover:bg-primary/30"
                }`}
              >
                <span className="w-5 text-center">{link.icon}</span>
                <span className="ml-3">{link.text}</span>
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <PixelButton
            onClick={logout}
            className="flex items-center w-full justify-start"
            variant="danger"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng Xuất</span>
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
