"use client";

import React, { useState } from "react";
import "./ai.css";
import axios from "axios";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage: ChatMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/bookings/ai-chat",
        JSON.stringify(input), // gửi chuỗi JSON như trong curl
        {
          headers: {
            "Content-Type": "text/plain",
            Accept: "*/*",
          },
        }
      );

      const aiReplyText = JSON.stringify(response.data, null, 2);
      const aiMessage: ChatMessage = { sender: "ai", text: aiReplyText };

      setMessages((prev) => [...prev, aiMessage]);
      setInput("");
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        sender: "ai",
        text: "Đã có lỗi xảy ra khi kết nối AI.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          placeholder="Nhập yêu cầu đặt sân..."
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default AIChat;
