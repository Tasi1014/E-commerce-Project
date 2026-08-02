import { useState } from "react";
import { toast } from "sonner";
import { FiMail, FiSend, FiShield } from "react-icons/fi";
import { BsTag } from "react-icons/bs";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Welcome to PEAK! Use code PEAK10 for 10% off");
    setEmail("");
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-16 bg-[#F5F0EB]">
      <div className="max-w-[1440px] mx-auto">
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#21123e] via-[#35215c] to-[#21123e] p-8 sm:p-12 lg:p-16 text-white text-center shadow-2xl border border-white/10">
          
          {/* Subtle Glow Circle Backgrounds */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#4f378a]/40 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#c8b7ff]/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            
            {/* Promo Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#c8b7ff] text-xs font-bold tracking-wider uppercase">
              <BsTag size={13} />
              <span>JOIN THE PEAK CLUB</span>
            </div>

            {/* Title */}
            <h2 className="text-[28px] sm:text-[38px] lg:text-[44px] font-heading font-extrabold text-white leading-tight">
              Unlock 10% Off Your First Order
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
              Subscribe to receive exclusive preview drops, private sale invites, and seasonal lookbook releases delivered directly to your inbox.
            </p>

            {/* Email Form */}
            {subscribed ? (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-center gap-2 text-[#34d399] font-heading font-extrabold text-lg">
                  <FiShield size={20} />
                  <span>You're On The VIP List!</span>
                </div>
                <p className="text-xs text-white/80">
                  Use coupon code <span className="font-mono font-extrabold text-[#c8b7ff] bg-white/10 px-2 py-0.5 rounded">PEAK10</span> at checkout for 10% off.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                <div className="relative w-full">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder-white/50 outline-none focus:border-[#c8b7ff] focus:bg-white/15 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#4f378a] hover:bg-[#5f479a] text-white font-heading font-bold text-sm rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer border-none"
                >
                  <span>Subscribe</span>
                  <FiSend size={15} />
                </button>
              </form>
            )}

            <p className="text-[11px] text-white/50 font-normal">
              No spam ever. Unsubscribe anytime with a single click.
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}
