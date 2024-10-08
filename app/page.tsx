"use client";
import React from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatCard } from "@/components/chatCard";
import { ChatProvider } from "./ChatContext";

export default function Home() {
  return (
    <ChatProvider>
      <div className="flex h-screen gap-2">
        <Sidebar />
        <div className="flex-1 max-h-full flex flex-col">
          <ChatCard />
        </div>
      </div>
    </ChatProvider>
  );
}
