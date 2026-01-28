/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { FiSend, FiImage, FiX, FiShoppingBag } from "react-icons/fi";
import { toast } from "react-toastify";
import "../../../styles/AIAssistantChat.css";
import BookingModalAI from "@/utils/bookingModalAI";
import { addItemToCart } from "@/services/cartItem";
import ShopPaymentModal from "@/utils/shopPaymentModal";
import {
  postChatMessage,
  postImageMessage,
  BookingQuery,
  ProductDTO,
} from "@/services/ai";
import { useSelector } from "react-redux";
import { PitchResponseDTO } from "@/services/pitch";
import dayjs from "dayjs";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  imagePreview?: string;
  products?: ProductDTO[];

  matchedPitches?: PitchResponseDTO[];

  selectedPitch?: SelectedPitchDTO;

  pitchId?: string;
  bookingDate?: string | null;
  slotList?: number[];
  pitchType?: string;
  formattedDate?: string;
  formattedSlots?: string;
  formattedPitchType?: string;
  data?: any;

  orderInfo?: {
    product: ProductDTO;
    size: string;
    quantity: number;
  };
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

export interface AIChatProps {
  onClose: () => void;
}

interface SelectedPitchDTO {
  pitchId: string;
  providerAddressId: string;
  name: string;
  type: string;
  environment: string;
  price: number;
  description: string;
}

const SpeechRecognition =
  (typeof window !== "undefined" &&
    ((window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition)) ||
  null;

const AIChat: React.FC<AIChatProps> = ({ onClose }) => {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);

  const [aiCartId, setAiCartId] = useState<number | null>(null);

  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

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

  const [isShopPaymentOpen, setIsShopPaymentOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());

  const handleSubmitMessageRef = useRef(async (messageText: string) => {});

  const handleClose = () => setIsModalBookingOpen(false);

  // --- HELPER FUNCTIONS ---
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
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateStr;
    }
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
    setSelectedTimeSlots([]);
  }, [date]);

  useEffect(() => {
    let currentSession = localStorage.getItem("chat_session_id");

    if (!currentSession) {
      currentSession = "session_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chat_session_id", currentSession);
    }

    setSessionId(currentSession);

    setMessages([
      {
        sender: "ai",
        text: "Xin chào! Tôi là trợ lý. Bạn muốn đặt sân hay sản phẩm thể thao hôm nay?",
      },
    ]);
  }, []);

  useEffect(() => {
    const registerChatSession = async () => {
      if (user?.userId && sessionId) {
        try {
          const token = localStorage.getItem("token");
          console.log(token);
          await axios.post(
            `http://localhost:8080/api/users/${user.userId}/register-session?sessionId=${sessionId}`,
            {},
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );
          // console.log("Chat session registered for user:", user.userId);
        } catch (err) {
          console.error("Failed to register chat session", err);
        }
      }
    };
    registerChatSession();
  }, [user, sessionId]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  handleSubmitMessageRef.current = async (messageText: string) => {
    if (!messageText.trim()) return;
    const newUserMessage: ChatMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);
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
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;

          if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

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
        const data = await postImageMessage(base64String, sessionId || "guest");
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

      matchedPitches: data.data?.matchedPitches,

      selectedPitch: data.data?.selectedPitch,
    };

    if (data.data?.action === "ready_to_order" && data.data.selectedSize) {
      aiMsg.orderInfo = {
        product: data.data.product,
        size: data.data.selectedSize,
        quantity: data.data.quantity || 1,
      };
    }

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

  const handleBookSpecificPitch = (pitch: any, parentMsg: ChatMessage) => {
    const fieldData: FieldData = {
      id: pitch.pitchId,
      name: pitch.name,
      type: pitch.type,
      price: pitch.price,
      description: pitch.description,
      date: parentMsg.formattedDate || "",
      time: parentMsg.formattedSlots || "",
    };
    console.log(fieldData);
    setFieldData(fieldData);
    setIsModalBookingOpen(true);
  };

  const handleProductClick = (productId: number) => {
    router.push(`/sportShop/product/${productId}`);
  };

  const handleBuyProduct = async (
    product: ProductDTO,
    size: string,
    quantity: number
  ) => {
    if (!user || !user.userId) {
      toast.warn("Vui lòng đăng nhập để mua hàng");
      return;
    }

    try {
      const res = await addItemToCart({
        userId: user.userId,
        productId: product.id,
        quantity: quantity,
        size: size,
        cartId: null,
      });

      if (res && res.cartId) {
        setAiCartId(res.cartId);
        setIsShopPaymentOpen(true);
      }
    } catch (error) {
      console.error("Lỗi tạo đơn hàng AI:", error);
      toast.error("Không thể tạo đơn hàng ngay lúc này.");
    }
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
          <h3 className="font-bold text-lg">Trợ lý ảo</h3>
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
          className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto bg-gray-50"
        >
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full flex flex-col gap-2 ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              {msg.imagePreview && (
                <div className="max-w-[85%] relative group">
                  <img
                    src={msg.imagePreview}
                    alt="Uploaded"
                    onClick={() => setZoomedImageSrc(msg.imagePreview || null)}
                    className="rounded-2xl w-auto h-auto max-h-[300px] border-[3px] border-white shadow-md object-cover cursor-zoom-in transition-transform group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/0 transition-colors group-hover:bg-black/5 pointer-events-none"></div>
                </div>
              )}

              {msg.text && (
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-lg"
                      : "bg-white text-gray-800 rounded-bl-lg border border-gray-200"
                  }`}
                >
                  <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>

                  {msg.sender === "ai" &&
                    msg.data?.showImage === true &&
                    msg.data?.product?.imageUrl && (
                      <div className="mt-3">
                        <img
                          src={msg.data.product.imageUrl}
                          alt={msg.data.product.name}
                          onClick={() =>
                            setZoomedImageSrc(msg.data.product.imageUrl)
                          }
                          className="rounded-lg w-full max-w-[250px] h-auto object-cover border border-gray-200 cursor-zoom-in hover:opacity-95 transition-opacity bg-white"
                        />
                      </div>
                    )}

                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2 text-gray-800">
                      {msg.products.slice(0, 10).map((prod) => (
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
                              {prod.salePrice.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}{" "}
                              VND
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {prod.brand}
                            </p>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => router.push("/sportShop/product")}
                        className="w-full mt-1 text-xs text-blue-600 underline hover:text-blue-800 text-center cursor-pointer"
                      >
                        Xem tất cả
                      </button>
                    </div>
                  )}
                </div>
              )}

              {msg.sender === "ai" && msg.selectedPitch && (
                <div className="mt-3 w-full">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200 shadow-md relative overflow-hidden">
                    <h4 className="font-bold text-blue-800 text-base mb-1">
                      {msg.selectedPitch.name}
                    </h4>

                    <div className="flex gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {formatPitchType(msg.selectedPitch.type)}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full">
                        {msg.selectedPitch.environment === "INDOOR"
                          ? "Trong nhà"
                          : "Ngoài trời"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {msg.selectedPitch.description ||
                        "Chất lượng sân tốt, giá cả hợp lý."}
                    </p>

                    <div className="flex justify-between items-end border-t border-green-200 pt-3">
                      <div>
                        <p className="text-xs text-gray-500">Giá thuê:</p>
                        <span className="text-red-600 font-bold text-lg">
                          {Number(msg.selectedPitch.price).toLocaleString()} đ/h
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleBookSpecificPitch(msg.selectedPitch, msg)
                        }
                        className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm flex items-center gap-1"
                      >
                        Đặt ngay
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {msg.sender === "ai" &&
                msg.matchedPitches &&
                msg.matchedPitches.length > 0 && (
                  <div className="mt-3 flex flex-col gap-3 w-full">
                    {msg.matchedPitches.map((pitch: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-blue-700 text-sm">
                            {pitch.name}
                          </h4>
                          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {formatPitchType(pitch.type)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {pitch.description || "Mặt sân đẹp, thoáng mát"}
                        </p>

                        <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                          <span className="text-red-500 font-bold text-sm">
                            {Number(pitch.price).toLocaleString()} đ/h
                          </span>
                          <button
                            onClick={() => handleBookSpecificPitch(pitch, msg)}
                            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Đặt ngay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {msg.orderInfo && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex flex-col gap-2">
                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                    <strong>Đơn hàng:</strong> {msg.orderInfo.product.name}{" "}
                    <br />
                    <strong>Size:</strong> {msg.orderInfo.size} <br />
                    <strong>Số lượng:</strong> {msg.orderInfo.quantity} <br />
                    <strong>Tổng tạm tính:</strong>{" "}
                    {(
                      msg.orderInfo.product.salePrice * msg.orderInfo.quantity
                    ).toLocaleString()}{" "}
                    đ
                  </div>
                  <button
                    className="w-full bg-red-500 text-white text-xs font-bold px-3 py-2 rounded hover:bg-red-600 shadow-sm transition-colors flex items-center justify-center gap-1"
                    onClick={() =>
                      handleBuyProduct(
                        msg.orderInfo!.product,
                        msg.orderInfo!.size,
                        msg.orderInfo!.quantity
                      )
                    }
                  >
                    <FiShoppingBag /> Nhấn để thanh toán
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <div className="text-xs text-gray-400 p-2 italic">
              Đang suy nghĩ...
            </div>
          )}

          <div ref={messagesEndRef} />
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
              className={`p-2 rounded-full transition-colors ${
                selectedFile
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-100 cursor-pointer"
              }`}
              title="Gửi ảnh"
              disabled={isLoading}
            >
              <FiImage size={20} />
            </button>

            <input
              type="text"
              value={input}
              autoComplete="off"
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedFile ? "Thêm mô tả cho ảnh..." : "Nhập yêu cầu..."
              }
              className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />

            {/* <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-full transition-colors ${
                isListening
                  ? "text-red-500 bg-red-100"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FiMic size={20} />
            </button> */}

            <button
              type="submit"
              disabled={isLoading || (!input && !selectedFile)}
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

        {isShopPaymentOpen && (
          <ShopPaymentModal
            open={isShopPaymentOpen}
            onClose={() => {
              setIsShopPaymentOpen(false);
              setAiCartId(null);
            }}
            customCartId={aiCartId}
          />
        )}
      </motion.div>

      {zoomedImageSrc && (
        <motion.div
          key="zoom-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setZoomedImageSrc(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={zoomedImageSrc}
              alt="Zoomed"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setZoomedImageSrc(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <IoMdClose size={32} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;
