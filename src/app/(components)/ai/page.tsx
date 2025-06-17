"use client";

import React, { useEffect, useState } from "react";
import "./ai.css";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import BookingModalAI from "@/utils/bookingModalAI";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  pitchId?: string;
  bookingDate?: string | null;
  slotList?: number[];
  pitchType?: string;
  formattedDate?: string;
  formattedSlots?: string;
  formattedPitchType?: string;
  data?: any;
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

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isModalBookingOpen, setIsModalBookingOpen] = useState(false);
  const handleClose = () => setIsModalBookingOpen(false);

  const formatSlotToTime = (slots: number[] | undefined): string => {
    if (!slots || slots.length === 0) return "";
    const sortedSlots = [...slots].sort((a, b) => a - b);
    const timeRanges: string[] = [];
    let startSlot = sortedSlots[0];
    let prevSlot = startSlot;

    for (let i = 1; i <= sortedSlots.length; i++) {
      const currentSlot = sortedSlots[i];
      if (i === sortedSlots.length || currentSlot !== prevSlot + 1) {
        const startHour = startSlot + 5;
        const endHour = prevSlot + 6;
        timeRanges.push(
          `${startHour.toString().padStart(2, "0")}:00-${endHour
            .toString()
            .padStart(2, "0")}:00`
        );
        if (i < sortedSlots.length) startSlot = currentSlot;
      }
      prevSlot = currentSlot;
    }
    return timeRanges.join(", ");
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr || typeof dateStr !== "string") return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const formatPitchType = (pitchType: string | undefined): string => {
    if (!pitchType) return "Không xác định";
    switch (pitchType) {
      case "FIVE_A_SIDE":
        return "Sân 5";
      case "SEVEN_A_SIDE":
        return "Sân 7";
      case "ELEVEN_A_SIDE":
        return "Sân 11";
      case "ALL":
        return "Tất cả các sân";
      default:
        return pitchType;
    }
  };

  const formatDataToText = (data: any): string => {
    if (!data) return "";
    if (data.prices) {
      return data.prices
        .map((p: any) => `Sân ${p.name}: ${p.price} VNĐ`)
        .join("\n");
    }
    if (data.pitchCounts) {
      return Object.entries(data.pitchCounts)
        .map(
          ([type, count]: [string, any]) =>
            `${formatPitchType(type)}: ${count} sân`
        )
        .join("\n");
    }
    if (data.name && data.price) {
      return `Sân: ${data.name}\nLoại: ${formatPitchType(data.type)}\nGiá: ${data.price} VNĐ`;
    }
    if (data.pitchTypes) {
      return `Các loại sân: ${data.pitchTypes.map(formatPitchType).join(", ")}`;
    }
    if (data.totalPitches) {
      return `Tổng số sân: ${data.totalPitches} sân`;
    }
    return "";
  };

  useEffect(() => {
    const newSessionId = "session_" + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);

    setMessages([
      {
        sender: "ai",
        text: "Xin chào! Tôi là trợ lý đặt sân thể thao. Bạn muốn đặt sân vào ngày nào và khung giờ nào?",
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage: ChatMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "text/plain",
        Accept: "*/*",
      };

      if (sessionId) {
        headers["X-Session-Id"] = sessionId;
      }

      const response = await axios.post(
        "http://localhost:8080/api/bookings/ai-chat",
        input,
        { headers }
      );

      const data = response.data;
      console.log("API Response:", data);

      // Xử lý sessionId nếu server trả về
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Hiển thị thông tin session trong console để debug
      console.log(`Current Session ID: ${sessionId}`);

      if (Array.isArray(data)) {
        const aiMessages: ChatMessage[] = data.map((item: any) => ({
          sender: "ai",
          text: `Sân: ${item.name || "Không xác định"}\nGiá: ${item.price || "0"} VNĐ\nMô tả: ${item.description || "Không có mô tả"}`,
          pitchId: item.pitchId,
          bookingDate: item.bookingDate,
          slotList: item.slotList || [],
          pitchType: item.pitchType,
          formattedDate: formatDate(item.bookingDate),
          formattedSlots: formatSlotToTime(item.slotList),
          formattedPitchType: formatPitchType(item.pitchType),
        }));
        setMessages((prev) => [...prev, ...aiMessages]);
      } else if (data.message) {
        const aiMessage: ChatMessage = {
          sender: "ai",
          text:
            data.message +
            (data.data ? "\n" + formatDataToText(data.data) : ""),
          data: data.data,
          pitchType: data.pitchType || "ALL",
          formattedPitchType: formatPitchType(data.pitchType || "ALL"),

          // Hiển thị session trong message nếu cần
          //   ...(sessionId && { sessionInfo: `Session ID: ${sessionId}` }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const aiMessage: ChatMessage = {
          sender: "ai",
          text: "Phản hồi không hợp lệ từ AI.",
          pitchType: "ALL",
          formattedPitchType: formatPitchType("ALL"),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }

      setInput("");
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        sender: "ai",
        text: `Đã có lỗi xảy ra: ${error.message}`,
        pitchType: "ALL",
        formattedPitchType: formatPitchType("ALL"),
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

    const fieldData: FieldData = {
      id: msg.pitchId || "",
      name,
      type: msg.formattedPitchType || "",
      price,
      description,
      date: msg.formattedDate || "",
      time: msg.formattedSlots || "",
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
                {msg.sender === "ai" && (
                  <>
                    {msg.formattedDate && (
                      <div>
                        <strong>Ngày:</strong> {msg.formattedDate}
                      </div>
                    )}
                    {msg.formattedSlots && (
                      <div>
                        <strong>Khung giờ:</strong> {msg.formattedSlots}
                      </div>
                    )}
                    {msg.formattedPitchType && msg.formattedDate && (
                      <div>
                        <strong>Loại sân:</strong> {msg.formattedPitchType}
                      </div>
                    )}
                    {msg.pitchId && msg.formattedDate && (
                      <button
                        className="book-button"
                        onClick={() => handleBookField(msg)}
                      >
                        Đặt sân
                      </button>
                    )}
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
