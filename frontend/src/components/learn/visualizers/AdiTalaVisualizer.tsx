"use client";

import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause } from "lucide-react";

interface BeatInfo {
  beat: number;
  kriya: "clap" | "finger-count" | "wave";
  action: string;
  finger?: string;
  anga: "Laghu" | "Dhrutam";
  sollukattu: string;
}

const ADI_TALA_BEATS: BeatInfo[] = [
  { beat: 1, kriya: "clap", action: "Clap", anga: "Laghu", sollukattu: "Tai" },
  { beat: 2, kriya: "finger-count", action: "Count", finger: "Little Finger", anga: "Laghu", sollukattu: "Ya" },
  { beat: 3, kriya: "finger-count", action: "Count", finger: "Ring Finger", anga: "Laghu", sollukattu: "Tai" },
  { beat: 4, kriya: "finger-count", action: "Count", finger: "Middle Finger", anga: "Laghu", sollukattu: "Hi" },
  { beat: 5, kriya: "clap", action: "Clap", anga: "Dhrutam", sollukattu: "Tai" },
  { beat: 6, kriya: "wave", action: "Wave (Visarjitam)", anga: "Dhrutam", sollukattu: "Ya" },
  { beat: 7, kriya: "clap", action: "Clap", anga: "Dhrutam", sollukattu: "Tai" },
  { beat: 8, kriya: "wave", action: "Wave (Visarjitam)", anga: "Dhrutam", sollukattu: "Hi" },
];

export default function AdiTalaVisualizer({ className = "" }: { className?: string }) {
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempoBpm, setTempoBpm] = useState<number>(60); // 1 beat per second
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / tempoBpm) * 1000;
      timerRef.current = setInterval(() => {
        setCurrentBeat((prev) => (prev % 8) + 1);
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, tempoBpm]);

  const activeBeat = ADI_TALA_BEATS[currentBeat - 1];

  return (
    <div className={`rounded-2xl border border-card-border bg-card/80 p-5 shadow-sm text-foreground ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-foreground/10">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <h4 className="serif text-[1rem] font-semibold text-foreground/95">
            Adi Tala 8-Beat Visualizer (Chaturashra Jaati Triputa Tala)
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 transition-colors ${
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30"
            }`}
          >
            {isPlaying ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
            <span>{isPlaying ? "Pause Tala" : "Start Pulse"}</span>
          </button>
        </div>
      </div>

      {/* 8-Beat Visual Grid */}
      <div className="grid grid-cols-8 gap-1.5 mb-4">
        {ADI_TALA_BEATS.map((b) => {
          const isActive = b.beat === currentBeat;
          const isLaghu = b.anga === "Laghu";
          return (
            <div
              key={b.beat}
              onClick={() => setCurrentBeat(b.beat)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between h-20 ${
                isActive
                  ? "bg-primary text-black font-bold border-primary shadow-md scale-105"
                  : isLaghu
                  ? "bg-foreground/5 border-foreground/12 text-foreground/80 hover:border-primary/40"
                  : "bg-foreground/[0.03] border-foreground/10 text-foreground/60 hover:border-primary/40"
              }`}
            >
              <span className="mono text-[10px] font-bold">Beat {b.beat}</span>
              <span className={`serif text-xs ${isActive ? "text-black" : "text-primary"}`}>
                {b.sollukattu}
              </span>
              <span className="mono text-[8px] uppercase tracking-tighter opacity-80 truncate">
                {b.action}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active Beat Explanation & Anga Breakdown */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold font-mono text-base">
            {currentBeat}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="serif font-bold text-sm text-foreground">
                Beat {currentBeat}: {activeBeat.action}
              </span>
              <span className="mono text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-foreground/10 text-primary border border-foreground/15">
                {activeBeat.anga} (
                {activeBeat.anga === "Laghu" ? "4 Counts" : "2 Counts"})
              </span>
            </div>
            <p className="serif text-xs text-foreground/75 mt-0.5">
              {activeBeat.finger ? `Touch ${activeBeat.finger} with thumb` : activeBeat.action} · Syllable: <em>&ldquo;{activeBeat.sollukattu}&rdquo;</em>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mono text-[9px] uppercase tracking-wider text-foreground/50">Tempo:</span>
          {[60, 90, 120].map((bpm) => (
            <button
              key={bpm}
              type="button"
              onClick={() => setTempoBpm(bpm)}
              className={`mono text-[9px] px-2 py-0.5 rounded border ${
                tempoBpm === bpm
                  ? "bg-primary text-black font-semibold border-primary"
                  : "bg-foreground/5 text-foreground/60 border-foreground/10 hover:text-foreground"
              }`}
            >
              {bpm === 60 ? "1x (Prathama)" : bpm === 90 ? "1.5x" : "2x (Dvitheeya)"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
