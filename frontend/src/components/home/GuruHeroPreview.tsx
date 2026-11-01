"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Play, RotateCcw, Sparkles } from "lucide-react";
import DanceDeck from "@/components/home/DanceDeck";
import type { Sex } from "@/components/three/figureRig";

const NamasteFigure = dynamic(() => import("@/components/three/NamasteFigure"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-black/40">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/45">
          Loading 3D Natyacharya…
        </span>
      </div>
    </div>
  ),
});

export default function GuruHeroPreview() {
  const [tab, setTab] = useState<"guru" | "forms">("guru");
  const [sex, setSex] = useState<Sex>("female");
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="relative w-full max-w-lg lg:max-w-none mx-auto">
      {/* Top switch tabs: 3D Guru vs Classical Traditions */}
      <div className="flex items-center justify-between pb-3 border-b border-foreground/10 mb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-foreground/[0.04] border border-foreground/10">
          <button
            type="button"
            onClick={() => setTab("guru")}
            className={`mono rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.16em] transition-colors ${
              tab === "guru"
                ? "bg-primary text-black font-medium shadow-sm"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            3D Virtual Guru
          </button>
          <button
            type="button"
            onClick={() => setTab("forms")}
            className={`mono rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.16em] transition-colors ${
              tab === "forms"
                ? "bg-primary text-black font-medium shadow-sm"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            7 Classical Forms
          </button>
        </div>

        {tab === "guru" && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSex("female")}
              className={`mono rounded-full px-2.5 py-1 text-[9px] uppercase tracking-wider transition-colors ${
                sex === "female"
                  ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                  : "text-foreground/50 hover:text-foreground border border-transparent"
              }`}
            >
              Woman
            </button>
            <button
              type="button"
              onClick={() => setSex("male")}
              className={`mono rounded-full px-2.5 py-1 text-[9px] uppercase tracking-wider transition-colors ${
                sex === "male"
                  ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                : "text-foreground/50 hover:text-foreground border border-transparent"
              }`}
            >
              Man
            </button>
          </div>
        )}
      </div>

      {tab === "guru" ? (
        <div className="relative rounded-2xl border border-foreground/15 bg-gradient-to-b from-card/90 to-background/95 p-3.5 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Subtle temple glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

          {/* 3D Stage Canvas */}
          <div className="relative h-[22rem] sm:h-[26rem] lg:h-[28rem] w-full rounded-xl overflow-hidden bg-black/50 border border-foreground/10">
            <NamasteFigure
              key={resetKey}
              sex={sex}
              showBody={false}
              showJoints={false}
              zoom={4.2}
              className="h-full w-full"
            />

            {/* Badges on stage */}
            <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col gap-1">
              <span className="mono inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 border border-foreground/15 text-[9px] uppercase tracking-[0.16em] text-foreground/80 shadow-md">
                <Sparkles className="h-3 w-3 text-primary" />
                Aharya Abhinaya Rig
              </span>
              <span className="serif text-[0.82rem] italic text-foreground/60 pl-1">
                Anjali Mudra · Samapada
              </span>
            </div>

            {/* Stage Reset & Hint */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <span className="mono text-[9px] uppercase tracking-[0.14em] text-foreground/45 bg-background/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-foreground/10">
                Drag to orbit · Scroll to zoom
              </span>

              <button
                type="button"
                onClick={() => setResetKey((k) => k + 1)}
                title="Reset Camera"
                className="pointer-events-auto mono inline-flex items-center gap-1 rounded-full bg-background/80 hover:bg-background px-2.5 py-1 text-[9px] uppercase tracking-wider text-foreground/70 hover:text-primary border border-foreground/15 transition-colors"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Bottom Card Footer with Direct Action */}
          <div className="mt-3.5 pt-3 border-t border-foreground/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Featured Beginner Lesson
              </p>
              <h3 className="serif text-[1.15rem] leading-tight text-foreground/90 mt-0.5">
                Part 1: Namaskaram
              </h3>
              <p className="mono text-[10px] text-foreground/50 mt-0.5">
                1m 27s · 11 Steps · Goonj Vernacular Voice
              </p>
            </div>

            <Link
              href="/learn/bharatanatyam/namaskaram"
              className="mono inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-black font-semibold transition-all hover:bg-primary/85 active:scale-95 shadow-md shrink-0"
            >
              <Play className="h-3 w-3 fill-black" />
              Open In 3D Player
            </Link>
          </div>
        </div>
      ) : (
        <DanceDeck />
      )}
    </div>
  );
}
