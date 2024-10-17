import React from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { user } = useUser();

  return (
    <div className="flex justify-between items-center w-full bg-card border-2 border-b-0 rounded-lg rounded-b-none p-4 mx-0">
      <div className="flex items-center">
        <Button
          className="md:hidden mr-2"
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={24} />
        </Button>
        <p className="text-sm text-foreground/50">public preview</p>
      </div>
      <div className="flex items-center">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
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
  );
};

export default ChatHeader;
