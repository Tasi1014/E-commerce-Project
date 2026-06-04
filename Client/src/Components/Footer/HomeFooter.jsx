export default function HomeFooter(){
    return (
        <footer className="bg-white border-t border-[#e6e0e9] pt-16 px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-12 pb-12">
            {/* Brand */}
            <div>
              <p className="text-xl font-extrabold tracking-wide mb-4">PEAK</p>
              <p className="text-sm text-[#49454f] leading-[1.7] mb-6">
                Curating the finest minimalist essentials for a modern, intentional lifestyle.
              </p>
              <div className="flex gap-3">
                {[
                  <path key="tw" d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>,
                  <><rect key="ig-rect" width="20" height="20" x="2" y="2" rx="5" ry="5"/><path key="ig-path" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line key="ig-line" x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
                  <><rect key="em-rect" width="20" height="16" x="2" y="4" rx="2"/><path key="em-path" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
                ].map((paths, i) => (
                  <button key={i} className="w-10 h-10 rounded-full bg-[#f2ecf4] border-none cursor-pointer flex items-center justify-center hover:bg-[#e9ddff] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f378a" strokeWidth="2">
                      {paths}
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-5">Shop</p>
              {["All Collections", "New Arrivals", "Women", "Men", "Accessories"].map((link) => (
                <a key={link} href="#" className="block text-sm text-[#49454f] no-underline mb-3 hover:text-[#4f378a] transition-colors">
                  {link}
                </a>
              ))}
            </div>

            {/* Customer Care */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-5">Customer Care</p>
              {["Shipping & Returns", "Privacy Policy", "Terms of Service", "Sustainability", "Contact Us"].map((link) => (
                <a key={link} href="#" className="block text-sm text-[#49454f] no-underline mb-3 hover:text-[#4f378a] transition-colors">
                  {link}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-5">Newsletter</p>
              <p className="text-sm text-[#49454f] leading-[1.6] mb-5">
                Subscribe to receive updates, access to exclusive deals, and more.
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-[#cbc4d2] rounded-lg text-sm mb-3 outline-none focus:border-[#4f378a] transition-colors"
              />
              <button className="w-full py-3.5 bg-[#4f378a] text-white text-sm font-bold rounded-lg border-none cursor-pointer hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#e6e0e9] py-6 flex justify-between items-center">
            <p className="text-sm text-[#7a7582]">© 2026 PEAK LUXE. CURATED MINIMALISM.</p>
            <div className="flex gap-2">
              <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
                <rect width="36" height="22" rx="4" fill="#f2ecf4"/>
                <text x="7" y="15" fontSize="9" fontWeight="700" fill="#4f378a">VISA</text>
              </svg>
              <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
                <rect width="36" height="22" rx="4" fill="#f2ecf4"/>
                <circle cx="14" cy="11" r="6" fill="#eb001b" fillOpacity="0.85"/>
                <circle cx="22" cy="11" r="6" fill="#f79e1b" fillOpacity="0.85"/>
              </svg>
            </div>
          </div>
        </div>
      </footer>
    )
}