/**
 * FormContainer.jsx
 * ─────────────────────────────────────────────
 * Reusable layout wrapper for all auth forms (Login, Register, etc.).
 *
 * Handles:
 *  - Full-page centering with branded background
 *  - White card with rounded corners and soft shadow
 *  - Optional title and subtitle rendered at the top
 *  - All form content passed as children
 *
 * Props:
 *  - title    (string)    : Main heading inside the card (e.g. "Welcome Back")
 *  - subtitle (string)    : Subheading below title (e.g. "Sign in to your PEAK account")
 *  - children (ReactNode) : The form and any other inner content
 *
 * Usage:
 *  <FormContainer title="Welcome Back" subtitle="Sign in to your PEAK account">
 *    <form>...</form>
 *  </FormContainer>
 */

export default function FormContainer({ title, subtitle, children }) {
  return (
    /* ── Full-page background ── */
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F0EB] flex items-center justify-center py-16 px-6">

      {/* ── White card ── */}
      <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-10 md:p-12 border border-[#e6e0e9]/40">

        {/* ── Card header: title + subtitle ── */}
        {(title || subtitle) && (
          <div className="mb-10 text-center">
            {title && (
              <h1 className="text-[32px] font-extrabold text-[#1d1b20] tracking-tight mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-[#49454f]">{subtitle}</p>
            )}
          </div>
        )}

        {/* ── Form content (Login / Register fields, button, links) ── */}
        {children}
      </div>
    </div>
  );
}
