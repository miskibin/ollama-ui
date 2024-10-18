import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu, Star } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getPatrons } from "@/lib/get-patronite-users";
import { useChatStore } from "@/lib/store";
import { Badge } from "./ui/badge";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { user } = useUser();
  const [isPatron, setIsPatron] = useState(false);
  const setPatrons = useChatStore((state) => state.setPatrons);

  useEffect(() => {
    const fetchAndSetPatrons = async () => {
      try {
        const patronList = await getPatrons();
        setPatrons(patronList);
        if (user && user.email) {
          setIsPatron(patronList.includes(user.email));
        }
      } catch (error) {
        console.error("Failed to fetch patrons:", error);
      }
    };

    fetchAndSetPatrons();
  }, [user, setPatrons]);

  return (
    <div
      className={`flex flex-col w-full ${
        isPatron
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg"
          : "bg-card"
      } border-b border-border p-3 mx-0`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            className={`md:hidden mr-2 ${
              isPatron ? "text-white hover:bg-white/20" : "text-foreground"
            }`}
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </Button>
          <p
            className={`text-lg font-semibold ${
              isPatron ? "text-white" : "text-foreground/50"
            }`}
          >
            Asystent RP
            <Badge className="ml-2 hidden md:inline" variant="destructive">
              beta
            </Badge>
          </p>
          {isPatron && (
            <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-300 mr-2" />
              <p className="text-sm font-medium text-white">Dziękuję!</p>
            </div>
          )}
        </div>
        <div className="flex items-center">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    isPatron
                      ? "text-white hover:bg-white/20"
                      : "text-foreground"
                  }
                >
                  <span className="sr-only">Opcje</span>
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/profile-client" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/api/auth/logout" className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Wyloguj</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
