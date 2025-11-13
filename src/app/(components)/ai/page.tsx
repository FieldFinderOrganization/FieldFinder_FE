"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  FormEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { FiMic, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";
import "../../../styles/AIAssistantChat.css";
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

const SpeechRecognition =
  (typeof window !== "undefined" &&
    ((window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition)) ||
  null;

const AIChat: React.FC<AIChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [fieldData, setFieldData] = useState<FieldData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isModalBookingOpen, setIsModalBookingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
        text: "Xin chào! Tôi là trợ lý đặt sân. Bạn muốn đặt sân vào ngày nào và khung giờ nào? (Hãy thử nói vào micro!)",
      },
    ]);
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmitMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim()) return;
      const newUserMessage: ChatMessage = { sender: "user", text: messageText };
      setMessages((prev) => [...prev, newUserMessage]);
      setIsLoading(true);
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
          messageText,
          { headers }
        );
        const data = response.data;
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
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
      } catch (error: any) {
        const errorMessage: ChatMessage = {
          sender: "ai",
          text: `Đã có lỗi xảy ra: ${error.message}`,
          pitchType: "ALL",
          formattedPitchType: formatPitchType("ALL"),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setInput("Đang nghe...");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInput("");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSubmitMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (
        event.error === "not-allowed" ||
        event.error === "permission-denied"
      ) {
        toast.error("Bạn đã từ chối quyền truy cập micro.");
      } else if (event.error === "network") {
        toast.error(
          "Lỗi mạng, không thể nhận diện giọng nói. Vui lòng thử lại."
        );
      }
    };
  }, [handleSubmitMessage]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmitMessage(input);
    setInput("");
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast.warn("Trình duyệt này không hỗ trợ giọng nói.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
      }
    }
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
      >
        <div className="flex justify-between items-center p-3 bg-[#0d6efd] text-white flex-shrink-0">
          <h3 className="font-bold text-lg">Trợ lý đặt sân</h3>
          <button
            onClick={onClose}
            title="Đóng"
            className="p-1 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div
          ref={chatWindowRef}
          className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto bg-gray-100 chat-window"
        >
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-lg"
                    : "bg-white text-gray-800 rounded-bl-lg border border-gray-200"
                }`}
              >
                <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>
                {msg.sender === "ai" && (
                  <>
                    {msg.formattedDate && (
                      <div className="mt-2 text-xs opacity-80">
                        <strong>Ngày:</strong> {msg.formattedDate}
                      </div>
                    )}
                    {msg.formattedSlots && (
                      <div className="text-xs opacity-80">
                        <strong>Khung giờ:</strong> {msg.formattedSlots}
                      </div>
                    )}
                    {msg.formattedPitchType && msg.formattedDate && (
                      <div className="text-xs opacity-80">
                        <strong>Loại sân:</strong> {msg.formattedPitchType}
                      </div>
                    )}
                    {msg.pitchId && msg.formattedDate && (
                      <button
                        className="mt-3 bg-green-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                        onClick={() => handleBookField(msg)}
                      >
                        Đặt sân
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex justify-start"
            >
              <div className="max-w-[80%] p-3 rounded-2xl shadow-sm bg-white text-gray-800 rounded-bl-lg border border-gray-200">
                {/* === THAY THẾ PHẦN NÀY === */}
                <div className="flex gap-1.5">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-loadingDotsBounce"
                    style={{ animationDelay: "-0.32s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-loadingDotsBounce"
                    style={{ animationDelay: "-0.16s" }}
                  ></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-loadingDotsBounce"></span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="p-3 border-t border-gray-200 bg-white flex items-center gap-2 flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isListening}
            placeholder={isListening ? "Đang nghe..." : "Nhập yêu cầu..."}
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit(e);
              }
            }}
          />

          {SpeechRecognition && (
            <button
              type="button"
              onClick={handleMicClick}
              title="Ghi âm"
              className={`mic-button ${isListening ? "is-listening" : ""}`}
            >
              <FiMic size={18} />
            </button>
          )}

          <button
            type="submit"
            title="Gửi"
            disabled={isLoading || !input}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600 disabled:bg-gray-400"
          >
            <FiSend size={18} />
          </button>
        </form>

        {isModalBookingOpen && fieldData && fieldData.id && (
          <BookingModalAI
            open={isModalBookingOpen}
            onClose={handleClose}
            fieldData={fieldData}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChat;
