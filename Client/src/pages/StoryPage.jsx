import StorySection from "../Components/Home/Story";

export default function StoryPage() {
  return (
    <>
      {/* Compact Page Header */}
      <div className="bg-[#F5F0EB] px-4 sm:px-8 lg:px-16 pt-10 pb-8 border-b border-[#1d1b20]/8">
        <div className="max-w-[1440px] mx-auto">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4f378a] block mb-2">
            About PEAK
          </span>
          <h1 className="text-[32px] sm:text-[44px] lg:text-[52px] font-heading font-extrabold text-[#1d1b20] leading-tight tracking-tight">
            Our Story
          </h1>
        </div>
      </div>
      <StorySection />
    </>
  );
}
