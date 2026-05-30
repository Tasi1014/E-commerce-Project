const PrimaryButton = ({ text }) => {
  return (
    <button className="px-10 py-4 bg-[#4f378a] text-white text-sm font-bold rounded-xl cursor-pointer border-none hover:bg-[#5f479a] transition-all hover:scale-105 duration-300 shadow-[0_10px_30px_rgba(79,55,138,0.3)]">
      {text}
    </button>
  );
};

export default PrimaryButton;