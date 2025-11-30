"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { FiMic, FiSend, FiImage, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "../../../styles/AIAssistantChat.css";
import BookingModalAI from "@/utils/bookingModalAI";
import {
  postChatMessage,
  postImageMessage,
  BookingQuery,
  ProductDTO,
} from "@/services/ai";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  imagePreview?: string;
  products?: ProductDTO[];

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
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [fieldData, setFieldData] = useState<FieldData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isModalBookingOpen, setIsModalBookingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitMessageRef = useRef(async (messageText: string) => {});

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
  //   async (messageText: string) => {
  //     if (!messageText.trim()) return;
  //     const newUserMessage: ChatMessage = { sender: "user", text: messageText };
  //     setMessages((prev) => [...prev, newUserMessage]);
  //     setIsLoading(true);
  //     try {
  //       const headers: Record<string, string> = {
  //         "Content-Type": "text/plain",
  //         Accept: "*/*",
  //       };
  //       if (sessionId) {
  //         headers["X-Session-Id"] = sessionId;
  //       }
  //       const response = await axios.post(
  //         "http://localhost:8080/api/bookings/ai-chat",
  //         messageText,
  //         { headers }
  //       );
  //       const data = response.data;
  //       if (data.sessionId) {
  //         setSessionId(data.sessionId);
  //       }
  //       if (Array.isArray(data)) {
  //         const aiMessages: ChatMessage[] = data.map((item: any) => ({
  //           sender: "ai",
  //           text: `Sân: ${item.name || "Không xác định"}\nGiá: ${item.price || "0"} VNĐ\nMô tả: ${item.description || "Không có mô tả"}`,
  //           pitchId: item.pitchId,
  //           bookingDate: item.bookingDate,
  //           slotList: item.slotList || [],
  //           pitchType: item.pitchType,
  //           formattedDate: formatDate(item.bookingDate),
  //           formattedSlots: formatSlotToTime(item.slotList),
  //           formattedPitchType: formatPitchType(item.pitchType),
  //         }));
  //         setMessages((prev) => [...prev, ...aiMessages]);
  //       } else if (data.message) {
  //         const aiMessage: ChatMessage = {
  //           sender: "ai",
  //           text:
  //             data.message +
  //             (data.data ? "\n" + formatDataToText(data.data) : ""),
  //           data: data.data,
  //           pitchType: data.pitchType || "ALL",
  //           formattedPitchType: formatPitchType(data.pitchType || "ALL"),
  //         };
  //         setMessages((prev) => [...prev, aiMessage]);
  //       } else {
  //         const aiMessage: ChatMessage = {
  //           sender: "ai",
  //           text: "Phản hồi không hợp lệ từ AI.",
  //           pitchType: "ALL",
  //           formattedPitchType: formatPitchType("ALL"),
  //         };
  //         setMessages((prev) => [...prev, aiMessage]);
  //       }
  //     } catch (error: any) {
  //       const errorMessage: ChatMessage = {
  //         sender: "ai",
  //         text: `Đã có lỗi xảy ra: ${error.message}`,
  //         pitchType: "ALL",
  //         formattedPitchType: formatPitchType("ALL"),
  //       };
  //       setMessages((prev) => [...prev, errorMessage]);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [sessionId]
  // );

  handleSubmitMessageRef.current = async (messageText: string) => {
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
  };

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
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
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
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Tạo canvas để vẽ lại ảnh với kích thước nhỏ hơn
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // Giới hạn chiều rộng 800px (đủ cho AI)
          const scaleSize = MAX_WIDTH / img.width;

          // Nếu ảnh nhỏ hơn giới hạn thì giữ nguyên, ngược lại thì resize
          if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Xuất ra base64 với định dạng JPEG và chất lượng 0.7 (70%)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    e.target.value = "";
  };

  const clearSelectedImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || !sessionId) return;
    const userText = input;
    const currentFile = selectedFile;
    setInput("");
    setIsLoading(true);

    try {
      if (currentFile) {
        const base64String = await compressImage(currentFile);
        setMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: userText,
            imagePreview: base64String,
          },
        ]);
        clearSelectedImage();
        const data = await postImageMessage(base64String);
        processAIResponse(data);
      } else if (userText) {
        setMessages((prev) => [...prev, { sender: "user", text: userText }]);
        const data = await postChatMessage(userText, sessionId);
        processAIResponse(data);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Xin lỗi, tôi gặp sự cố kết nối." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const processAIResponse = (data: BookingQuery) => {
    let displayText = data.message;

    if (!displayText) {
      if (data.data?.products && data.data.products.length > 0) {
        displayText = "Dưới đây là các sản phẩm tôi tìm được:";
      } else {
        displayText = "Tôi đã nhận được yêu cầu nhưng không có kết quả.";
      }
    }

    const aiMsg: ChatMessage = {
      sender: "ai",
      text: displayText,
      products: data.data?.products,

      pitchType: data.pitchType,
      formattedPitchType: formatPitchType(data.pitchType),
      bookingDate: data.bookingDate,
      formattedDate: formatDate(data.bookingDate),
      slotList: data.slotList,
      formattedSlots: formatSlotToTime(data.slotList),
      data: data.data,
    };
    setMessages((prev) => [...prev, aiMsg]);
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

  const handleProductClick = (productId: number) => {
    router.push(`/sportShop/product/${productId}`);
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
                {msg.imagePreview && (
                  <div className="mb-2 group relative">
                    <img
                      src={msg.imagePreview}
                      alt="Uploaded"
                      onClick={() =>
                        setZoomedImageSrc(msg.imagePreview || null)
                      }
                      className="rounded-xl w-auto h-auto max-h-[200px] max-w-full sm:max-w-[240px] object-contain shadow-sm mx-auto cursor-zoom-in hover:opacity-90 transition-opacity mix-blend-mode-screen"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 rounded-xl pointer-events-none"></div>
                  </div>
                )}

                <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 text-gray-800">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleProductClick(prod.id)}
                        className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex gap-2 items-start cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-12 h-12 object-cover rounded bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs truncate text-blue-900">
                            {prod.name}
                          </p>
                          <p className="text-xs text-red-500 font-semibold">
                            {prod.price.toLocaleString()} đ
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {prod.brand}
                          </p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => router.push("/sportShop")}
                      className="w-full mt-1 text-xs text-blue-600 underline hover:text-blue-800 text-center"
                    >
                      Xem tất cả
                    </button>
                  </div>
                )}

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

        <div className="bg-white border-t border-gray-200">
          {previewUrl && (
            <div className="px-4 pt-3 pb-1 flex w-full relative">
              <div className="relative inline-block group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-16 w-16 object-contain rounded-lg border border-gray-300 shadow-sm bg-white mix-blend-multiply"
                />
                <button
                  onClick={clearSelectedImage}
                  className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors cursor-pointer"
                >
                  <FiX size={12} />
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleFormSubmit}
            className="p-3 flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={handleImageClick}
              className={`p-2 rounded-full transition-colors ${selectedFile ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600 hover:bg-gray-100 cursor-pointer"}`}
              title="Gửi ảnh"
              disabled={isLoading}
            >
              <FiImage size={20} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedFile ? "Thêm mô tả cho ảnh..." : "Nhập yêu cầu..."
              }
              className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-full transition-colors ${isListening ? "text-red-500 bg-red-100" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <FiMic size={20} />
            </button>

            <button
              type="submit"
              disabled={isLoading || (!input && !selectedFile)} // Disable nếu ko có text VÀ ko có ảnh
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>

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
