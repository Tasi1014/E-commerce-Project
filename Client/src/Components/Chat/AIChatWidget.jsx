import { useEffect, useRef, useState, useCallback } from "react";
import { sendMessageToAI } from "../../api/aiApi";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const SUGGESTED_PROMPTS = [
  { label: "Track my order", icon: "◷" },
  { label: "Payment Options", icon: "✦" },
  { label: "Return policy", icon: "↺" },
  { label: "Defective items received", icon: "✧" },
];

const COLORS = {
  purple: "#4F378A",
  cream: "#F7F3EE",
};

const DEFAULT_WIDTH = 380;
const DEFAULT_HEIGHT = 600;
const MIN_WIDTH = 320;
const MAX_WIDTH = 560;
const MIN_HEIGHT = 420;
const MAX_HEIGHT = 800;
const DESKTOP_BREAKPOINT = 640;
const MARGIN = 20;

const CURSOR_BY_DIRECTION = {
  top: "ns-resize",
  bottom: "ns-resize",
  left: "ew-resize",
  right: "ew-resize",
  "top-left": "nwse-resize",
  "bottom-right": "nwse-resize",
  "top-right": "nesw-resize",
  "bottom-left": "nesw-resize",
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= DESKTOP_BREAKPOINT : true
  );

  // Explicit box model: { x, y, width, height } — set once on first open
  const [box, setBox] = useState(null);

  // Drag/resize interaction state
  const interaction = useRef(null); // { mode: 'move' | direction, startX, startY, startBox }
  const [cursorOverride, setCursorOverride] = useState(null);
  const windowRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize box position on first open (anchored bottom-right, like the original default)
  useEffect(() => {
    if (isOpen && !box && isDesktop) {
      setBox({
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        x: window.innerWidth - DEFAULT_WIDTH - MARGIN,
        y: window.innerHeight - DEFAULT_HEIGHT - MARGIN,
      });
    }
  }, [isOpen, box, isDesktop]);

  // ---- Unified drag + resize handling ----
  const startInteraction = useCallback(
    (mode) => (e) => {
      if (e.target.closest("button")) return;
      if (!isDesktop || !box) return;
      e.preventDefault();

      interaction.current = {
        mode,
        startX: e.clientX,
        startY: e.clientY,
        startBox: { ...box },
      };
      setCursorOverride(mode === "move" ? "grabbing" : CURSOR_BY_DIRECTION[mode]);
    },
    [isDesktop, box]
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!interaction.current) return;

      const { mode, startX, startY, startBox } = interaction.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let { x, y, width, height } = startBox;

      if (mode === "move") {
        x = startBox.x + dx;
        y = startBox.y + dy;
        x = Math.max(0, Math.min(x, window.innerWidth - width));
        y = Math.max(0, Math.min(y, window.innerHeight - height));
      } else {
        // Resize logic per direction
        if (mode.includes("right")) {
          width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startBox.width + dx));
        }
        if (mode.includes("left")) {
          const proposed = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startBox.width - dx));
          x = startBox.x + (startBox.width - proposed);
          width = proposed;
        }
        if (mode.includes("bottom")) {
          height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startBox.height + dy));
        }
        if (mode.includes("top")) {
          const proposed = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startBox.height - dy));
          y = startBox.y + (startBox.height - proposed);
          height = proposed;
        }
      }

      setBox({ x, y, width, height });
    };

    const handleMouseUp = () => {
      interaction.current = null;
      setCursorOverride(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // ---- Chat logic (unchanged) ----
  const handleSendMessage = async (message) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmedMessage },
    ]);
    setIsLoading(true);

    try {
      const data = await sendMessageToAI(trimmedMessage, sessionId);
      setSessionId(data.session_id);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
      setError(error.message || "Unable to get a response from AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  const handleMinimize = () => setIsOpen(false);
  const handleClose = () => {
    setIsOpen(false);
    resetChat();
    setBox(null);
  };

  const windowStyle = (() => {
    if (!isDesktop) return {};
    if (!box) return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, right: MARGIN, bottom: MARGIN };
    return {
      width: box.width,
      height: box.height,
      left: box.x,
      top: box.y,
      right: "auto",
      bottom: "auto",
      cursor: cursorOverride || undefined,
    };
  })();

  // Resize handle definitions: [directionKey, positioning classes]
  const edgeHandles = [
    { dir: "top", style: { top: -3, left: 8, right: 8, height: 6, cursor: "ns-resize" } },
    { dir: "bottom", style: { bottom: -3, left: 8, right: 8, height: 6, cursor: "ns-resize" } },
    { dir: "left", style: { left: -3, top: 8, bottom: 8, width: 6, cursor: "ew-resize" } },
    { dir: "right", style: { right: -3, top: 8, bottom: 8, width: 6, cursor: "ew-resize" } },
  ];
  const cornerHandles = [
    { dir: "top-left", style: { top: -4, left: -4, width: 14, height: 14, cursor: "nwse-resize" } },
    { dir: "top-right", style: { top: -4, right: -4, width: 14, height: 14, cursor: "nesw-resize" } },
    { dir: "bottom-left", style: { bottom: -4, left: -4, width: 14, height: 14, cursor: "nesw-resize" } },
    { dir: "bottom-right", style: { bottom: -4, right: -4, width: 14, height: 14, cursor: "nwse-resize" } },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: COLORS.purple }}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(79,55,138,0.4)] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200"
          aria-label="Open PEAK AI chat"
        >
          <span className="text-xl">✦</span>
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={windowRef}
          style={windowStyle}
          className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-white sm:inset-auto sm:rounded-3xl sm:border sm:shadow-[0_20px_60px_rgba(79,55,138,0.22)] ${
            interaction.current ? "select-none" : ""
          }`}
        >
          {/* Resize handles — desktop only */}
          {isDesktop && (
            <>
              {edgeHandles.map(({ dir, style }) => (
                <div
                  key={dir}
                  onMouseDown={startInteraction(dir)}
                  style={{ position: "absolute", zIndex: 10, ...style }}
                  className="hidden sm:block"
                />
              ))}
              {cornerHandles.map(({ dir, style }) => (
                <div
                  key={dir}
                  onMouseDown={startInteraction(dir)}
                  style={{ position: "absolute", zIndex: 11, ...style }}
                  className="hidden sm:block"
                />
              ))}
            </>
          )}

          {/* Header — drag handle */}
          <div
            onMouseDown={startInteraction("move")}
            style={{ backgroundColor: COLORS.purple }}
            className="flex shrink-0 items-center justify-between px-4 py-4 text-white sm:cursor-grab"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                <span className="text-lg">✦</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-semibold">PEAK AI</h2>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-[11px] text-white/70">
                    Here to assist your styling &amp; orders
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Reset chat"
                title="Reset chat"
              >
                ↻
              </button>
              <button
                type="button"
                onClick={handleMinimize}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Minimize chat"
                title="Minimize"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages — scrollable region */}
          <div
            style={{ backgroundColor: COLORS.cream }}
            className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-2.5">
                  <div
                    style={{ backgroundColor: COLORS.purple }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                  >
                    <span className="text-sm">✦</span>
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-black/5 bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm leading-relaxed text-gray-800">
                      Welcome to{" "}
                      <span style={{ color: COLORS.purple }} className="font-semibold">
                        PEAK
                      </span>
                      . I'm your digital concierge.
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      How may I help today? I can track orders, guide you on sizing, or recommend products.
                    </p>
                  </div>
                </div>

                <div className="ml-42px flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handleSendMessage(prompt.label)}
                      style={{ color: COLORS.purple, borderColor: `${COLORS.purple}33` }}
                      className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-black/0.02"
                    >
                      <span className="text-[11px]">{prompt.icon}</span>
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span
                          style={{ backgroundColor: COLORS.purple }}
                          className="h-1.5 w-1.5 animate-bounce rounded-full opacity-70 [animation-delay:-0.3s]"
                        />
                        <span
                          style={{ backgroundColor: COLORS.purple }}
                          className="h-1.5 w-1.5 animate-bounce rounded-full opacity-70 [animation-delay:-0.15s]"
                        />
                        <span
                          style={{ backgroundColor: COLORS.purple }}
                          className="h-1.5 w-1.5 animate-bounce rounded-full opacity-70"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-black/5 bg-white">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}
    </>
  );
}