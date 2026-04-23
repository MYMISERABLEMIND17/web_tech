import { SparklesIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const items = [
  {
    title: "Campus Highlights",
    body: "Share a win, start a thread, or find collaborators.",
    icon: SparklesIcon,
    accent: "from-electric-400/25 to-transparent",
  },
  {
    title: "Project Drops",
    body: "Post launches, demos, and repo links. Get feedback fast.",
    icon: AcademicCapIcon,
    accent: "from-electric-500/25 to-transparent",
  },
  {
    title: "Hackathon Radar",
    body: "Keep your feed tuned for upcoming events & teams.",
    icon: SparklesIcon,
    accent: "from-navy-400/25 to-transparent",
  },
];

export default function CampusHighlights() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-navy-200">Now</p>
          <p className="text-base font-semibold text-navy-50">Campus stream</p>
        </div>
        <span className="text-xs text-navy-200 border border-navy-200/15 bg-navy-900/30 rounded-full px-3 py-1">
          curated
        </span>
      </div>

      <div className="px-4 pb-4">
        <Swiper
          spaceBetween={12}
          slidesPerView={1.1}
          breakpoints={{
            640: { slidesPerView: 1.6 },
            768: { slidesPerView: 2.1 },
            1024: { slidesPerView: 2.4 },
          }}
        >
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <SwiperSlide key={it.title}>
                <div className="relative rounded-2xl border border-navy-200/10 bg-navy-900/35 p-4 overflow-hidden">
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${it.accent}`} />
                  <div className="relative flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-navy-200/15 bg-navy-900/40">
                      <Icon className="w-5 h-5 text-electric-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-50">{it.title}</p>
                      <p className="text-xs text-navy-200 mt-0.5 leading-relaxed">
                        {it.body}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}

