import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetStats } from "@workspace/api-client-react";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, GaugeCircle, Wrench, Coffee } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

type Slide = { id: number; imageUrl: string; videoUrl?: string | null; title: string; subtitle: string };

function useTrackVisit() {
  useEffect(() => {
    if (sessionStorage.getItem("rc_visited")) return;
    sessionStorage.setItem("rc_visited", "1");
    fetch("/api/visits", { method: "POST" }).catch(() => {});
  }, []);
}

function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/slides")
      .then(r => r.json())
      .then((data: Slide[]) => {
        const active = data.filter((s: Slide & { active?: boolean }) => s.active !== false);
        setSlides(active.length ? active : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    fetch("/api/notice").then(r => r.json()).then(d => setNotice(d.notice ?? "")).catch(() => {});
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % Math.max(slides.length, 1)), [slides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1)), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [slides.length, next]);

  const slide = slides[current];

  return (
    <>
      {/* ── Image slider – NO text overlay on the image ── */}
      <section className="relative h-[85vh] md:h-screen overflow-hidden bg-background">
        {loaded && slides.map((s, i) => (
          <div key={s.id} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === current ? 1 : 0 }}>
            {s.videoUrl ? (
              <video src={s.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
            )}
          </div>
        ))}

        {(!loaded || slides.length === 0) && (
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=2940&auto=format&fit=crop" alt="RC Racing" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Watermark logo – very faint, stays on image as non-text decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] z-0 pointer-events-none select-none">
          <img src="/logo.jpeg" alt="" className="w-[80vw] max-w-[800px] h-auto object-cover mix-blend-screen" />
        </div>

        {/* Prev / Next arrows */}
        {slides.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center border border-white/20 bg-black/30 hover:bg-primary/80 transition-colors text-white" aria-label="Previous slide">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center border border-white/20 bg-black/30 hover:bg-primary/80 transition-colors text-white" aria-label="Next slide">
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 transition-all ${i === current ? "bg-primary w-6" : "bg-white/40 hover:bg-white/70"}`} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Caption bar BELOW the image ── */}
      <div className="bg-card border-b border-border/50">
        {notice && (
          <div className="bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest text-center py-2 px-4">
            {notice}
          </div>
        )}
        {slide && (slide.title || slide.subtitle) && (
          <div className="container py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            {slide.title && (
              <h2 className="text-base font-bold uppercase tracking-widest text-foreground">{slide.title}</h2>
            )}
            {slide.subtitle && (
              <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Individual Sections ──────────────────────────────────────────────────────

function StatsSection({ stats, totalVisits }: { stats: any; totalVisits: number }) {
  return (
    <div className="border-y border-border/50 bg-card">
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 divide-x divide-border/30 text-center">
          <div className="space-y-2">
            <h4 className="text-4xl font-bold font-serif text-primary">{stats?.totalTracks ?? 3}+</h4>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Racing Tracks</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-4xl font-bold font-serif text-primary">{stats?.memberCount ?? 500}+</h4>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Active Members</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-4xl font-bold font-serif text-primary">{stats?.totalBookings ?? 1000}+</h4>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Sessions Run</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-4xl font-bold font-serif text-primary">{stats?.yearsOpen ?? 1}</h4>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Years Open</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-4xl font-bold font-serif text-primary">{totalVisits > 0 ? totalVisits.toLocaleString("en-IN") : "—"}</h4>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Website Visitors</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold font-serif uppercase tracking-tight mb-4">The Experience</h2>
            <p className="text-muted-foreground text-lg">Everything you need for a full day of adrenaline-fueled action.</p>
          </div>
          <Button asChild variant="link" className="text-primary hover:text-primary/80 uppercase tracking-widest font-bold">
            <Link href="/services">View All Services <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-card border border-border/50 p-8 hover:border-primary/50 transition-all duration-300">
            <GaugeCircle className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold mb-3 uppercase tracking-wide">Track Rental</h3>
            <p className="text-muted-foreground mb-6">Professional grade carpet and dirt tracks. Timing systems available. Bring your own car or rent ours.</p>
            <div className="text-sm font-bold text-primary">From Rs 150 / 30 Min</div>
          </div>
          <div className="group bg-card border border-border/50 p-8 hover:border-primary/50 transition-all duration-300">
            <Wrench className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold mb-3 uppercase tracking-wide">Pro Shop</h3>
            <p className="text-muted-foreground mb-6">Parts broke? Need an upgrade? Our fully stocked pit shop has bodies, motors, batteries, and tools.</p>
            <Link href="/shop" className="text-sm font-bold text-primary hover:underline flex items-center">Shop Parts <ArrowRight className="ml-1 w-4 h-4" /></Link>
          </div>
          <div className="group bg-card border border-border/50 p-8 hover:border-primary/50 transition-all duration-300">
            <Coffee className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold mb-3 uppercase tracking-wide">Cafe & Chill</h3>
            <p className="text-muted-foreground mb-6">Fuel up between heats with espresso, cold shakes, burgers, and pizzas while watching the races.</p>
            <Link href="/menu" className="text-sm font-bold text-primary hover:underline flex items-center">View Menu <ArrowRight className="ml-1 w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="py-24 bg-card border-y border-border/50 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 mix-blend-overlay" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23fff'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23fff'/%3E%3C/svg%3E\")",backgroundSize:"40px 40px"}} />
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold font-serif uppercase tracking-tight mb-6">Ready to Race?</h2>
          <p className="text-xl text-muted-foreground mb-8">Open 7 days a week. Book your track time online to guarantee your spot on the driver's stand.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[["30 Minutes","Rs 150"],["1 Hour","Rs 250"],["Full Day Pass","Rs 700"],["Basic Drift Rental (15m)","Rs 150"]].map(([label, price]) => (
              <div key={label} className="flex justify-between items-center p-4 border border-border/50 bg-background/50">
                <span className="font-bold">{label}</span>
                <span className="text-primary font-serif text-xl font-bold">{price}</span>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="rounded-none h-14 px-10 text-base uppercase tracking-widest font-bold bg-primary hover:bg-primary/90">
            <Link href="/book">Book Your Session</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container text-center max-w-2xl">
        <MapPin className="w-12 h-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold font-serif uppercase tracking-wide mb-4">Find The Track</h2>
        <p className="text-muted-foreground mb-8">Located in the heart of the city with dedicated parking and easy access.</p>
        <Button asChild variant="outline" className="rounded-none uppercase tracking-widest font-bold border-primary/50 hover:bg-primary hover:text-primary-foreground">
          <a href="https://maps.app.goo.gl/3S5WxWXwAi9S7ThK6" target="_blank" rel="noreferrer">Open in Google Maps</a>
        </Button>
      </div>
    </section>
  );
}

// ─── Section registry ─────────────────────────────────────────────────────────
const DEFAULT_ORDER = ["stats", "services", "pricing", "map"];

export default function Home() {
  useTrackVisit();
  const { data: stats } = useGetStats();
  const [totalVisits, setTotalVisits] = useState(0);
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_ORDER);

  useEffect(() => {
    fetch("/api/visits/stats").then(r => r.json()).then(d => setTotalVisits(d.totalVisits)).catch(() => {});
    fetch("/api/layout").then(r => r.json()).then(d => { if (Array.isArray(d.order)) setSectionOrder(d.order); }).catch(() => {});
  }, []);

  function renderSection(key: string) {
    switch (key) {
      case "stats":    return <StatsSection key="stats" stats={stats} totalVisits={totalVisits} />;
      case "services": return <ServicesSection key="services" />;
      case "pricing":  return <PricingSection key="pricing" />;
      case "map":      return <MapSection key="map" />;
      default:         return null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSlider />
      {sectionOrder.map(renderSection)}
    </div>
  );
}
