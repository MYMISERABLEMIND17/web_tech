import { useMemo } from "react";

export default function AppShell({ children, variant = "app" }) {
  const chrome = useMemo(() => {
    if (variant === "auth") return { padTop: "pt-0", max: "max-w-6xl" };
    return { padTop: "pt-0", max: "max-w-5xl" };
  }, [variant]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-3xl bg-electric-400/15" />
      <div className="pointer-events-none absolute -top-52 -right-44 h-[620px] w-[620px] rounded-full blur-3xl bg-navy-400/15" />
      <div className="pointer-events-none absolute -bottom-56 left-1/2 -translate-x-1/2 h-[720px] w-[720px] rounded-full blur-3xl bg-electric-500/10" />

      {/* Content */}
      <div className={`relative ${chrome.padTop}`}>
        <div className={`${chrome.max} mx-auto px-4 sm:px-6 lg:px-8`}>
          {children}
        </div>
      </div>
    </div>
  );
}

