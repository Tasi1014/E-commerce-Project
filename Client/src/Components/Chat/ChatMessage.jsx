export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-gray-100 text-gray-800"
        }`}
      >
        {content}
      </div>
    </div>
  );
}