import { useState } from "react";

export default function ChatInput({ onSend, isLoading }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    onSend(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-gray-200 bg-white p-3"
    >
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask PEAK AI..."
        rows={1}
        disabled={isLoading}
        className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        aria-label="Send message"
      >
        ↑
      </button>
    </form>
  );
}