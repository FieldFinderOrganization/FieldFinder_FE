"use client";

import React, { useState } from "react";
import "./ai.css";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import BookingModalAI from "@/utils/bookingModalAI";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  pitchId?: string;
  bookingDate?: string;
  slotList?: number[];
  pitchType?: string;
}

interface FieldData {
  id: string;
  name: string;
  type: string;
  price: string;
  description: string;
  date: string;
  time: string;
}

interface AIChatProps {
  onClose: () => void;
}
const AIChat: React.FC<AIChatProps> = ({ onClose }) => {
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [fieldData, setFieldData] = useState<FieldData | null>({
    id: "",
    name: "",
    type: "",
    price: "",
    description: "",
    date: "",
    time: "",
  });

  const [isModalBookingOpen, setIsModalBookingOpen] = useState(false);
  const handleClose = () => setIsModalBookingOpen(false);

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
          sender: "ai",
          text: `Sân: ${item.name}\nGiá: ${item.price}\nMô tả: ${item.description}`,
          pitchId: item.pitchId,
          bookingDate: item.bookingDate,
          slotList: item.slotList,
          pitchType: item.pitchType,
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

  const handleBookField = (msg: ChatMessage) => {
    const textParts = msg.text.split("\n");
    const name = textParts[0]?.split(": ")[1] || "Không xác định";
    const price = textParts[1]?.split(": ")[1] || "0";
    const description = textParts[2]?.split(": ")[1] || "Không có mô tả";

    const timeSlots = (msg.slotList || [])
      .map((slot) => {
        const startHour = slot + 5;
        return `${startHour}:00 - ${startHour + 1}:00`;
      })
      .join(", ");

    const fieldData: FieldData = {
      id: msg.pitchId || "",
      name,
      type: msg.pitchType || "",
      price,
      description,
      date: msg.bookingDate || "",
      time: timeSlots,
    };

    setFieldData(fieldData);
    setIsModalBookingOpen(true);
  };

  return (
    <div className="chat-outer-wrapper">
      <div className="chat-container">
        <div className="chat-header flex justify-between items-center p-3 bg-[#0d6efd] text-white">
          <h3 className="font-bold">Trợ lý đặt sân</h3>
          <button
            onClick={onClose}
            className="close-button text-white text-xl hover:text-gray-200 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <div className="message-text">
                <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>
                {msg.sender === "ai" && msg.bookingDate && (
                  <>
                    <div>
                      <strong>Ngày:</strong> {msg.bookingDate}
                    </div>
                    <div>
                      <strong>Khung giờ:</strong> {msg.slotList?.join(", ")}
                    </div>
                    <div>
                      <strong>Loại sân:</strong> {msg.pitchType}
                    </div>
                    <button
                      className="book-button"
                      onClick={() => handleBookField(msg)}
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
      <BookingModalAI
        open={isModalBookingOpen}
        onClose={handleClose}
        fieldData={fieldData as FieldData}
      />
    </div>
  );
};

export default AIChat;
