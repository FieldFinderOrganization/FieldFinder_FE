/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  IconButton,
  Paper,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: string;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUserId || !receiverId) return;

      try {
        const response = await axios.get(
          `http://localhost:8080/api/chat/history`,
          {
            params: {
              user1: currentUserId,
              user2: receiverId,
            },
          },
        );

        if (response.data) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử chat:", error);
      }
    };

    fetchHistory();
  }, [currentUserId, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    let isMounted = true; // Cờ kiểm tra component còn hiển thị không

    const initChat = () => {
      const StompJs = (window as any).StompJs;
      const SockJS = (window as any).SockJS;

      if (StompJs && SockJS && isMounted) {
        const client = new StompJs.Client({
          webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            if (!isMounted) {
              client.deactivate();
              return;
            }
            setIsConnected(true);
            console.log("Đã kết nối WebSocket thành công!");

            client.subscribe(`/topic/messages/${currentUserId}`, (msg: any) => {
              if (msg.body) {
                const newMsg: ChatMessage = JSON.parse(msg.body);
                if (
                  newMsg.senderId === receiverId ||
                  newMsg.senderId === currentUserId
                ) {
                  setMessages((prev) => [...prev, newMsg]);
                }
              }
            });
          },
          onStompError: (frame: any) => {
            console.error("Lỗi STOMP: " + frame.headers["message"]);
          },
        });

        client.activate();
        clientRef.current = client; // Lưu thẳng vào Ref để đảm bảo không bị thất lạc
        setStompClient(client);
      }
    };

    const loadScripts = () => {
      if ((window as any).SockJS && (window as any).StompJs) {
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

    // CLEANUP chuẩn xác: Dùng Ref để ngắt kết nối, diệt tận gốc lỗi nhân đôi tin nhắn
    return () => {
      isMounted = false;
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        console.log("Đã ngắt kết nối WebSocket cũ.");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, receiverId]);

  const sendMessage = () => {
    if (inputMessage.trim() && stompClient && isConnected) {
      const chatMessage: ChatMessage = {
        senderId: currentUserId,
        receiverId: receiverId,
        content: inputMessage.trim(),
      };

      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(chatMessage),
      });

      setMessages((prev) => [
        ...prev,
        { ...chatMessage, timestamp: new Date().toISOString() },
      ]);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Hàm fomat thời gian chuẩn Việt Nam
  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return "Vừa xong";
    const date = new Date(isoString);
    return `${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}, ${date.toLocaleDateString("vi-VN")}`;
  };

  return (
    <Paper
      elevation={4}
      className="flex flex-col w-[350px] h-[450px] rounded-t-lg overflow-hidden fixed bottom-4 right-4 z-50"
    >
      {/* Header */}
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

      {/* Message List */}
      <Box className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <Box
              key={idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              {/* Bọc Tooltip */}
              <Tooltip
                title={formatMessageTime(msg.timestamp)}
                placement={isMe ? "left" : "right"}
                arrow
                enterDelay={200}
              >
                <Box
                  className={`max-w-[75%] px-3 py-2 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity ${
                    isMe
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <Typography variant="body2">{msg.content}</Typography>
                </Box>
              </Tooltip>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box className="p-3 bg-white border-t flex gap-2 items-center">
        <TextField
          fullWidth
          size="small"
          placeholder="Nhập tin nhắn..."
          variant="outlined"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "20px" } }}
        />
        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={!inputMessage.trim() || !isConnected}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatBox;
