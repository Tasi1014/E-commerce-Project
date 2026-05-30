import { Link } from "react-router-dom";

export default function FormLink({
  text,
  to,
  className = "",
}) {
  return (
    <Link
      to={to}
      className={`text-xs font-bold text-[#4f378a] hover:text-[#5f479a] transition-colors duration-200 no-underline hover:underline decoration-2 underline-offset-4 ${className}`}
    >
      {text}
    </Link>
  );
}
