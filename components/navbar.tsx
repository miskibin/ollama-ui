import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Star } from "lucide-react";
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
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar: React.FC = () => {
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
    <nav
      className={`flex items-center justify-between w-full ${
        isPatron
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg"
          : "bg-card"
      } border-b border-border md:p-4 p-2 mx-0`}
    >
      <div className="flex items-center space-x-2">
        <SidebarTrigger
          className={`mr-2 ${
            isPatron ? "text-white hover:bg-white/20" : "text-foreground"
          }`}
        />
        <h1
          className={`text-lg font-semibold ${
            isPatron ? "text-white" : "text-foreground/50"
          }`}
        >
          Asystent RP
        </h1>
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
                  isPatron ? "text-white hover:bg-white/20" : "text-foreground"
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
    </nav>
  );
};

export default Navbar;
