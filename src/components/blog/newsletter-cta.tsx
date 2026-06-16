export function NewsletterCta() {
  return (
    <div className="border border-[#3A3A3A] bg-[#111111] p-8 text-center">
      <h3 className="font-mono text-[18px] font-bold text-white mb-2">
        Stay in the loop
      </h3>
      <p className="font-sans text-[14px] text-[#BBBBBB] max-w-[400px] mx-auto mb-6 leading-relaxed">
        Engineering insights, agent patterns, and production AI from the tracify team. No spam.
      </p>
      <div className="flex items-center justify-center gap-3">
        <input
          type="email"
          placeholder="you@example.com"
          disabled
          className="w-full max-w-[280px] bg-[#0A0A0A] border border-[#3A3A3A] px-4 py-2.5 font-mono text-[13px] text-[#BBBBBB] placeholder:text-[#555555] focus:outline-none focus:border-[#888888] transition-colors disabled:opacity-50"
        />
        <button
          disabled
          className="font-mono text-[13px] text-[#888888] border border-[#3A3A3A] px-4 py-2.5 bg-[#0A0A0A] disabled:opacity-50 cursor-not-allowed"
        >
          Subscribe
        </button>
      </div>
      <p className="font-mono text-[10px] text-[#555555] mt-3">
        Newsletter coming soon. Enter your email to be notified.
      </p>
    </div>
  );
}
