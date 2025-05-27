"use client";

import React, { useState } from "react";
import "./ai.css";
import axios from "axios";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  pitchId?: string;
  bookingDate?: string;
  slotList?: number[];
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
        input,
        {
          headers: {
            "Content-Type": "text/plain",
            Accept: "*/*",
          },
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        const aiMessages: ChatMessage[] = data.map((item: any) => ({
          sender: "ai" as const,
          text: `Pitch ID: ${item.pitchId}`,
          pitchId: item.pitchId,
          bookingDate: item.bookingDate,
          slotList: item.slotList,
        }));

        setMessages((prev) => [...prev, ...aiMessages]);
      } else {
        const aiMessage: ChatMessage = {
          sender: "ai",
          text: JSON.stringify(data),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }

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
    <div className="chat-outer-wrapper">
      <div className="chat-container">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <div className="message-text">
                {msg.text}
                {msg.sender === "ai" && msg.bookingDate && (
                  <>
                    <div>Ngày: {msg.bookingDate}</div>
                    <div>Khung giờ: {msg.slotList?.join(", ")}</div>
                    <button
                      className="book-button"
                      onClick={() => alert(`Đặt sân: ${msg.pitchId}`)}
                    >
                      Đặt sân
                    </button>
                  </>
                )}
              </div>
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
    </div>
  );
};

export default AIChat;
