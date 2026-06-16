export function NewsletterCta() {
  return (
    <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8 text-center">
      <h3 className="font-mono text-[18px] font-bold text-white mb-2">
        Stay in the loop
      </h3>
      <p className="font-sans text-[14px] text-[#999999] max-w-[400px] mx-auto mb-6 leading-relaxed">
        Engineering insights, agent patterns, and production AI from the tracify team. No spam.
      </p>
      <div className="flex items-center justify-center gap-3">
        <input
          type="email"
          placeholder="you@example.com"
          disabled
          className="w-full max-w-[280px] bg-[#050505] border border-[#2A2A2A] px-4 py-2.5 font-mono text-[13px] text-[#666666] placeholder:text-[#444444] focus:outline-none focus:border-[#666666] transition-colors disabled:opacity-50"
        />
        <button
          disabled
          className="font-mono text-[13px] text-[#444444] border border-[#2A2A2A] px-4 py-2.5 bg-[#050505] disabled:opacity-50 cursor-not-allowed"
        >
          Subscribe
        </button>
      </div>
      <p className="font-mono text-[10px] text-[#444444] mt-3">
        Newsletter coming soon. Enter your email to be notified.
      </p>
    </div>
  );
}
