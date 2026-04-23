import { useEffect, useMemo, useRef, useState } from "react";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";

export default function ChatBox() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const canChat = Boolean(user?._id);

  const title = useMemo(() => {
    if (!canChat) return "Chat (login required)";
    return "Global chat";
  }, [canChat]);

  useEffect(() => {
    if (!canChat) return;

    socket.connect();

    const onReceive = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receiveMessage", onReceive);

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.disconnect();
    };
  }, [canChat]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages.length]);

  const send = () => {
    if (!canChat) return;
    const message = input.trim();
    if (!message) return;

    socket.emit("sendMessage", { senderId: user._id, message });
    setInput("");
  };

  return (
    <div className="glass-card overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-50 truncate">{title}</p>
          {canChat && (
            <p className="text-xs text-navy-200 truncate">
              Signed in as {user?.name || "User"}
            </p>
          )}
        </div>
        <XMarkIcon
          className={`w-5 h-5 text-navy-200 transition-transform ${open ? "rotate-0" : "rotate-45"}`}
        />
      </button>

      {open && (
        <div className="border-t border-navy-200/10">
          <div className="max-h-72 overflow-auto px-3 py-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-xs text-navy-200 text-center py-6">
                No messages yet.
              </p>
            ) : (
              messages.map((m, idx) => {
                const mine = m?.senderId && m.senderId === user?._id;
                return (
                  <div
                    key={`${m?.createdAt || "t"}-${idx}`}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        mine
                          ? "bg-navy-900/60 text-navy-50 border border-navy-200/10"
                          : "bg-navy-900/30 text-navy-100 border border-navy-200/10"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m?.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-navy-200/10 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder={canChat ? "Type a message…" : "Login to chat"}
              disabled={!canChat}
              className="input-field text-sm"
            />
            <button
              type="button"
              onClick={send}
              disabled={!canChat || !input.trim()}
              className="btn-primary px-3 py-2 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}