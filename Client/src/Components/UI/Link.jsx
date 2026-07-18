import { Link } from "react-router-dom";

export default function ButtonLink({
  text,
  to,
  className = "",
}) {
  return (
    <Link
      to={to}
      className={`px-5 py-2.5 sm:px-10 sm:py-4 bg-[#4f378a] text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl cursor-pointer border-none hover:bg-[#5f479a] transition-all hover:scale-105 duration-300 shadow-[0_10px_30px_rgba(79,55,138,0.3)] ${className}`}
    >
      {text}
    </Link>
  );
}
