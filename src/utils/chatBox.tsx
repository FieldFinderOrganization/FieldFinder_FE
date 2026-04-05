/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  IconButton,
  Paper,
  Typography,
  Box,
  Tooltip,
  Backdrop,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import CancelIcon from "@mui/icons-material/Cancel";

declare global {
  interface Window {
    StompJs?: any;
    SockJS?: any;
  }
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: string;
  type?: string;
  isRead?: boolean;
}

interface ChatBoxProps {
  currentUserId: string;
  receiverId: string;
  receiverName: string;
  onClose?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  currentUserId,
  receiverId,
  receiverName,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [stompClient, setStompClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const shouldShowTime = (currentMsg: ChatMessage, prevMsg?: ChatMessage) => {
    if (!prevMsg) return true;
    if (!currentMsg.timestamp || !prevMsg.timestamp) return false;

    const currTime = new Date(currentMsg.timestamp).getTime();
    const prevTime = new Date(prevMsg.timestamp).getTime();

    // Nếu khoảng cách giữa 2 tin nhắn lớn hơn 30 phút
    return currTime - prevTime > 30 * 60 * 1000;
  };

  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    if (isToday) {
      return `${hours}:${minutes}`;
    } else {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${hours}:${minutes} ${day}/${month}`;
    }
  };

  useEffect(() => {
    const fetchInitialHistory = async () => {
      if (!currentUserId || !receiverId) return;
      try {
        await fetch(
          `http://localhost:8080/api/chat/mark-read?senderId=${receiverId}&receiverId=${currentUserId}`,
          { method: "POST" },
        );

        const response = await fetch(
          `http://localhost:8080/api/chat/history?user1=${currentUserId}&user2=${receiverId}&page=0&size=20`,
        );
        const data = await response.json();

        if (data && data.content) {
          const reversedMessages = [...data.content].reverse();
          setMessages(reversedMessages);

          // Hỗ trợ cả 2 chuẩn: PageImpl cũ (data.last) và PagedModel VIA_DTO mới (data.page)
          const isLastPage = data.page
            ? data.page.number >= data.page.totalPages - 1
            : data.last;

          setHasMore(!isLastPage);
          setPage(0);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      }
    };
    fetchInitialHistory();
  }, [currentUserId, receiverId]);

  // const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
  //   const target = e.target as HTMLDivElement;
  //   if (target.scrollTop === 0 && hasMore && !isLoadingMore) {
  //     setIsLoadingMore(true);
  //     const oldScrollHeight = target.scrollHeight;

  //     try {
  //       const nextPage = page + 1;
  //       const response = await fetch(
  //         `http://localhost:8080/api/chat/history?user1=${currentUserId}&user2=${receiverId}&page=${nextPage}&size=20`,
  //       );
  //       const data = await response.json();

  //       if (data && data.content) {
  //         const reversedOlderMessages = [...data.content].reverse();

  //         setMessages((prev) => [...reversedOlderMessages, ...prev]);

  //         // Hỗ trợ cả PageImpl cũ và PagedModel mới
  //         const isLastPage = data.page
  //           ? data.page.number >= data.page.totalPages - 1
  //           : data.last;

  //         setHasMore(!isLastPage);
  //         setPage(nextPage);

  //         setTimeout(() => {
  //           if (scrollContainerRef.current) {
  //             scrollContainerRef.current.scrollTop =
  //               scrollContainerRef.current.scrollHeight - oldScrollHeight;
  //           }
  //         }, 0);
  //       }
  //     } catch (error) {
  //       console.error("Lỗi khi tải thêm tin nhắn cũ:", error);
  //     } finally {
  //       setIsLoadingMore(false);
  //     }
  //   }
  // };

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    const initChat = () => {
      const StompJs = window.StompJs;
      const SockJS = window.SockJS;

      if (StompJs && SockJS) {
        const client = new StompJs.Client({
          webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            setIsConnected(true);

            // Đã thay đổi dấu "/" thành "." để Broker không hiểu nhầm đường dẫn
            client.subscribe(`/topic/messages.${currentUserId}`, (msg: any) => {
              if (msg.body) {
                const newMsg: ChatMessage = JSON.parse(msg.body);

                if (
                  newMsg.type === "TYPING" &&
                  newMsg.senderId === receiverId
                ) {
                  setIsTyping(true);
                  if (typingTimeoutRef.current)
                    clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(
                    () => setIsTyping(false),
                    3000,
                  );
                  setTimeout(scrollToBottom, 50);
                  return;
                }

                if (
                  newMsg.senderId === receiverId ||
                  newMsg.senderId === currentUserId
                ) {
                  setMessages((prev) => [...prev, newMsg]);

                  // Đang mở khung chat mà có tin nhắn tới đánh dấu đọc luôn
                  if (newMsg.senderId === receiverId) {
                    fetch(
                      `http://localhost:8080/api/chat/mark-read?senderId=${receiverId}&receiverId=${currentUserId}`,
                      { method: "POST" },
                    );
                  }

                  setIsTyping(false); // Có tin nhắn tới thì tắt chữ Đang gõ
                  setTimeout(scrollToBottom, 50);
                }
              }
            });
          },
          onStompError: (frame: any) => {
            // Hiển thị chi tiết lỗi "Invalid destination" trả về từ Backend
            console.error("Lỗi STOMP: " + frame.headers["message"]);
            console.error("Chi tiết Backend trả về: ", frame.body);
          },
        });

        client.activate();
        setStompClient(client);
      }
    };

    const loadScripts = () => {
      if (window.SockJS && window.StompJs) {
        initChat();
        return;
      }
      const sockJS = document.createElement("script");
      sockJS.src =
        "https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js";
      document.head.appendChild(sockJS);

      sockJS.onload = () => {
        const stompJS = document.createElement("script");
        stompJS.src =
          "https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js";
        document.head.appendChild(stompJS);

        stompJS.onload = () => {
          initChat();
        };
      };
    };

    loadScripts();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [currentUserId, receiverId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // Tạo link ảo để preview
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setSelectedImage(file);
          setPreviewUrl(URL.createObjectURL(file));
          e.preventDefault(); // Chặn việc paste tên file dạng text vào ô input
        }
        break;
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input file
  };

  const uploadImageToCloud = async (file: File): Promise<string> => {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dxgy8ilqu";
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "chat_preset";

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Tải ảnh lên Cloudinary thất bại!");
      }

      const data = await response.json();

      // data.secure_url chính là đường link https của tấm ảnh vừa up
      return data.secure_url;
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (
      (!inputMessage.trim() && !selectedImage) ||
      !stompClient ||
      !isConnected
    )
      return;

    let messageContent = inputMessage.trim();
    let messageType = "TEXT";

    // NẾU CÓ ẢNH -> UPLOAD ẢNH TRƯỚC TIÊN
    if (selectedImage) {
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadImageToCloud(selectedImage);
        messageContent = uploadedUrl; // Gán URL ảnh vào làm nội dung tin nhắn
        messageType = "IMAGE"; // Đổi type thành Ảnh
      } catch (error) {
        console.error("Lỗi up ảnh:", error);
        setIsUploading(false);
        return; // Up ảnh lỗi thì không gửi tin nhắn nữa
      }
      setIsUploading(false);
      removeSelectedImage(); // Up xong thì xóa preview
    }

    const chatMessage: ChatMessage = {
      senderId: currentUserId,
      receiverId: receiverId,
      content: messageContent,
      type: messageType,
    };

    try {
      stompClient.publish({
        destination: "/app/chat", // Đảm bảo Spring Boot có @MessageMapping("/chat")
        body: JSON.stringify(chatMessage),
      });

      setMessages((prev) => [
        ...prev,
        { ...chatMessage, timestamp: new Date().toISOString() },
      ]);
      setInputMessage("");
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error("Lỗi khi gửi STOMP message: ", error);
    }
  };

  const handleTyping = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInputMessage(e.target.value);

    if (stompClient && isConnected) {
      const typingEvent: ChatMessage = {
        senderId: currentUserId,
        receiverId: receiverId,
        content: "",
        type: "TYPING",
      };

      try {
        stompClient.publish({
          destination: "/app/chat", // Đảm bảo Spring Boot có @MessageMapping("/chat")
          body: JSON.stringify(typingEvent),
        });
      } catch (err) {
        console.log("Lỗi gửi trạng thái typing:", err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Paper
        elevation={4}
        className="flex flex-col w-[350px] h-[450px] rounded-t-lg overflow-hidden fixed bottom-4 right-[100px] z-50"
      >
        <Box className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {receiverName}
            </Typography>
            <Typography
              variant="caption"
              className="text-blue-100 flex items-center gap-1"
            >
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}
              ></span>
              {isConnected ? "Đang hoạt động" : "Đang kết nối..."}
            </Typography>
          </Box>
          {onClose && (
            <IconButton size="small" sx={{ color: "white" }} onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box
          ref={scrollContainerRef}
          className="flex-1 p-4 overflow-y-auto overscroll-contain bg-gray-50 flex flex-col gap-3 relative"
        >
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
            const showTime = shouldShowTime(msg, prevMsg);

            return (
              <React.Fragment key={idx}>
                {showTime && (
                  <Box className="flex justify-center my-2">
                    <Typography
                      variant="caption"
                      className="text-gray-400 font-medium"
                    >
                      {formatMessageTime(msg.timestamp)}
                    </Typography>
                  </Box>
                )}

                <Box
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <Tooltip
                    title={formatMessageTime(msg.timestamp)}
                    placement={isMe ? "left" : "right"}
                    arrow
                    slotProps={{
                      tooltip: {
                        sx: {
                          bgcolor: "rgba(0,0,0,0.7)",
                          fontSize: "11px",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  >
                    <Box
                      className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                        isMe
                          ? msg.type === "IMAGE"
                            ? "bg-transparent p-0"
                            : "bg-blue-500 text-white rounded-br-none"
                          : msg.type === "IMAGE"
                            ? "bg-transparent p-0"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.type === "IMAGE" ? (
                        <img
                          src={msg.content}
                          alt="chat-attachment"
                          onClick={() => setZoomedImage(msg.content)}
                          className={`max-w-full rounded-2xl cursor-pointer hover:opacity-90 transition-opacity ${isMe ? "rounded-br-none" : "rounded-bl-none"}`}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {msg.content}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              </React.Fragment>
            );
          })}

          {isTyping && (
            <Box className="flex justify-start my-1 animate-pulse">
              <Box className="bg-gray-200 text-gray-500 px-3 py-2 rounded-2xl rounded-bl-none italic text-xs">
                Đang gõ...
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {previewUrl && (
          <Box className="px-4 py-2 bg-gray-100 border-t flex relative">
            <Box className="relative">
              <img
                src={previewUrl}
                alt="preview"
                onClick={() => setZoomedImage(previewUrl)}
                className="h-16 w-16 object-cover rounded-lg border-2 border-blue-200 cursor-pointer"
              />
              <IconButton
                size="small"
                className="absolute -top-2 -right-2 bg-white text-gray-500 hover:text-red-500 shadow-sm"
                sx={{ padding: "2px", backgroundColor: "white" }}
                onClick={removeSelectedImage}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        <Box className="p-2 bg-white border-t flex gap-1 items-center relative">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <IconButton
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            size="small"
          >
            <ImageIcon />
          </IconButton>

          <TextField
            fullWidth
            size="small"
            placeholder="Nhập tin nhắn..."
            variant="outlined"
            value={inputMessage}
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "20px" } }}
            disabled={isUploading}
          />

          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={
              (!inputMessage.trim() && !selectedImage) ||
              !isConnected ||
              isUploading
            }
          >
            {isUploading ? (
              <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Paper>

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
        }}
        open={!!zoomedImage}
        onClick={() => setZoomedImage(null)} // Click ra ngoài cũng đóng
      >
        {zoomedImage && (
          <Box className="relative outline-none">
            {/* Tấm ảnh phóng to */}
            <img
              src={zoomedImage}
              alt="zoomed"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-2xl transition-transform transform scale-100 cursor-zoom-out"
            />
            {/* Nút X Đóng */}
            <IconButton
              sx={{
                position: "absolute",
                top: -40,
                right: -40,
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
              onClick={() => setZoomedImage(null)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Backdrop>
    </>
  );
};

export default ChatBox;
