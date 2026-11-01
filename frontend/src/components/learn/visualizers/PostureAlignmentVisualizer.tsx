"use client";

import React from "react";
import { Compass, ShieldAlert } from "lucide-react";

export default function PostureAlignmentVisualizer({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-card-border bg-card/80 p-5 shadow-sm text-foreground ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-foreground/10">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          <h4 className="serif text-[1rem] font-semibold text-foreground/95">
            Aramandi Diamond Geometry & Anatomical Alignment Checkpoints
          </h4>
        </div>
        <span className="mono text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
          Verified Kalakshetra & Tanjavur
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {/* Checkpoint 1: Spine & Torso */}
        <div className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
          <span className="mono text-[9px] uppercase tracking-wider text-primary font-bold block mb-1">
            1. Vertical Spine (Saushtava)
          </span>
          <p className="serif text-xs text-foreground/80 leading-relaxed">
            The spine remains perfectly vertical like a plumb line. The ribcage is lifted, shoulders rolled down and back, and head centered without forward tilt.
          </p>
        </div>

        {/* Checkpoint 2: Hip External Rotation */}
        <div className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
          <span className="mono text-[9px] uppercase tracking-wider text-primary font-bold block mb-1">
            2. External Hip Rotation
          </span>
          <p className="serif text-xs text-foreground/80 leading-relaxed">
            Knee turnout is achieved through the ball-and-socket hip joints. The knees open laterally sideways to form the horizontal vertices of the diamond.
          </p>
        </div>

        {/* Checkpoint 3: Knee-Toe Tracking */}
        <div className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
          <span className="mono text-[9px] uppercase tracking-wider text-primary font-bold block mb-1">
            3. Knee & Toe Tracking
          </span>
          <p className="serif text-xs text-foreground/80 leading-relaxed">
            The kneecaps track directly over the second and third toes. Weight is grounded evenly across the tripod of each foot: heel, big toe base, and pinky base.
          </p>
        </div>
      </div>

      {/* Safety Notice Box */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3.5 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-foreground/85 leading-relaxed">
          <strong className="text-amber-400 font-mono text-[10px] uppercase tracking-wider block mb-0.5">
            Safety Guidance: Avoid Forcing Foot Angle
          </strong>
          Never force your feet into a flat 180° line if your hips do not naturally open that far. Forcing turnout from the ankles causes severe torsional strain on the inner knee ligaments (MCL). Dance with your natural turnout and deepen with patient practice.
        </div>
      </div>
    </div>
  );
}
