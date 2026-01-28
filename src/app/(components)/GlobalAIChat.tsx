"use client";

import { useState } from "react";
import ChatIcon from "@mui/icons-material/Chat";
import AIChat from "./ai/AIChat";

export default function GlobalAIChat() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div
        className="fixed bottom-10 right-5 cursor-pointer z-50"
        onClick={() => setShowChat(!showChat)}
      >
        <ChatIcon
          sx={{
            width: 60,
            height: 60,
            transition: "transform 0.3s ease",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            padding: "10px",
            animationDuration: "0.3s",
            color: "#1976d2",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        />
      </div>

      {showChat && (
        <div className="fixed bottom-24 right-5 z-50 w-[350px] h-[450px] shadow-xl rounded-lg overflow-hidden">
          <AIChat onClose={() => setShowChat(false)} />
        </div>
      )}
    </>
  );
}
