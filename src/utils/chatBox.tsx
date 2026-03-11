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
          setHasMore(!data.last);
          setPage(0);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      }
    };
    fetchInitialHistory();
  }, [currentUserId, receiverId]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0 && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      const oldScrollHeight = target.scrollHeight;

      try {
        const nextPage = page + 1;
        const response = await fetch(
          `http://localhost:8080/api/chat/history?user1=${currentUserId}&user2=${receiverId}&page=${nextPage}&size=20`,
        );
        const data = await response.json();

        if (data && data.content) {
          const reversedOlderMessages = [...data.content].reverse();

          setMessages((prev) => [...reversedOlderMessages, ...prev]);
          setHasMore(!data.last);
          setPage(nextPage);

          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop =
                scrollContainerRef.current.scrollHeight - oldScrollHeight;
            }
          }, 0);
        }
      } catch (error) {
        console.error("Lỗi khi tải thêm tin nhắn cũ:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

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
            client.subscribe(`/topic/messages/${currentUserId}`, (msg: any) => {
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

                  // Đang mở khung chat mà có tin nhắn tới -> Đánh dấu đọc luôn
                  if (newMsg.senderId === receiverId) {
                    fetch(
                      `http://localhost:8080/api/chat/mark-read?senderId=${receiverId}&receiverId=${currentUserId}`,
                      { method: "POST" },
                    );
                  }

                  setIsTyping(false); // Có tin nhắn tới thì tắt chữ Đang gõ đi
                  setTimeout(scrollToBottom, 50);
                }
              }
            });
          },
          onStompError: (frame: any) => {
            console.error("Lỗi STOMP: " + frame.headers["message"]);
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

  const sendMessage = () => {
    if (inputMessage.trim() && stompClient && isConnected) {
      const chatMessage: ChatMessage = {
        senderId: currentUserId,
        receiverId: receiverId,
        content: inputMessage.trim(),
        type: "CHAT",
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
      setTimeout(scrollToBottom, 50);
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
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(typingEvent),
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Paper
      elevation={4}
      className="flex flex-col w-[350px] h-[450px] rounded-t-lg overflow-hidden fixed bottom-4 right-4 z-50"
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
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto overscroll-contain bg-gray-50 flex flex-col gap-3"
      >
        {isLoadingMore && (
          <Typography
            variant="caption"
            className="text-center text-gray-500 my-2"
          >
            Đang tải tin nhắn cũ...
          </Typography>
        )}

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

              <Box className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <Tooltip
                  title={formatMessageTime(msg.timestamp)}
                  placement={isMe ? "left" : "right"}
                  arrow
                  enterDelay={200}
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "rgba(0, 0, 0, 0.7)",
                        fontSize: "11px",
                        borderRadius: "8px",
                        padding: "4px 8px",
                      },
                    },
                    arrow: {
                      sx: {
                        color: "rgba(0, 0, 0, 0.7)",
                      },
                    },
                  }}
                >
                  <Box
                    className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                      isMe
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
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

      <Box className="p-3 bg-white border-t flex gap-2 items-center">
        <TextField
          fullWidth
          size="small"
          placeholder="Nhập tin nhắn..."
          variant="outlined"
          value={inputMessage}
          onChange={handleTyping}
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
