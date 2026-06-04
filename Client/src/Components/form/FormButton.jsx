/**
 * FormButton.jsx
 * ─────────────────────────────────────────────
 * Reusable submit button for all forms.
 *
 * Props:
 *  - text        (string)  : Default button label (e.g. "Sign In")
 *  - loadingText (string)  : Label shown during loading (e.g. "Signing In...")
 *  - isLoading   (boolean) : When true — shows spinner + loadingText, disables button
 *  - disabled    (boolean) : Explicitly disable the button (e.g. form invalid)
 *  - type        (string)  : Button type — "submit" | "button" | "reset" (default: "submit")
 *
 * Usage:
 *  <FormButton
 *    text="Sign In"
 *    loadingText="Signing In..."
 *    isLoading={isSubmitting}
 *  />
 */

export default function FormButton({
  text,
  loadingText = "Please wait...",
  isLoading = false,
  disabled = false,
  type = "submit",
}) {
  // The button should be non-interactive while loading or explicitly disabled
  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        w-full py-3.5
        bg-[#4f378a] text-white
        text-xs font-bold uppercase tracking-[0.1em]
        rounded-xl border-none cursor-pointer
        shadow-[0_8px_24px_rgba(79,55,138,0.25)]
        flex items-center justify-center gap-2
        transition-all duration-300
        ${
          isDisabled
            ? "opacity-60 cursor-not-allowed scale-100"                         // Muted when disabled
            : "hover:bg-[#5f479a] hover:shadow-[0_12px_28px_rgba(79,55,138,0.35)] hover:scale-[1.02] active:scale-[0.98]" // Active interactions
        }
      `}
    >
      {/* ── Loading spinner (CSS-based, no external lib) ── */}
      {isLoading && (
        <span
          className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
          aria-hidden="true"
        />
      )}

      {/* ── Button label — swaps between normal and loading text ── */}
      <span>{isLoading ? loadingText : text}</span>
    </button>
  );
}
