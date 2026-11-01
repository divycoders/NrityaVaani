"use client";

import React, { useState } from "react";
import { Sparkles, Music, Heart, Drama } from "lucide-react";

interface TriadElement {
  id: "nritta" | "nritya" | "natya";
  name: string;
  sanskrit: string;
  tagline: string;
  description: string;
  components: string[];
  roleInBharatanatyam: string;
  icon: typeof Music;
}

const TRIAD_DATA: TriadElement[] = [
  {
    id: "nritta",
    name: "Nritta",
    sanskrit: "नृत्त",
    tagline: "Pure Rhythmic & Geometric Dance",
    description:
      "Abstract dance composed strictly of adavus, footwork, speed variations (kalams), and crisp body lines with no emotional storytelling.",
    components: ["Adavu footwork", "Aramandi posture", "Adi Tala metrics", "Natyarambha arms"],
    roleInBharatanatyam: "Forms the structural physical skeleton of all adavu drills and Alarippu.",
    icon: Music,
  },
  {
    id: "nritya",
    name: "Nritya",
    sanskrit: "नृत्य",
    tagline: "Expressive Dance with Hastas & Bhava",
    description:
      "Dance that combines rhythm with poetic interpretation (Abhinaya), using single and double-hand gestures (Mudras) and facial expressions to express sentiment (Rasa).",
    components: ["28 Asamyukta Hastas", "Facial abhinaya", "Drishti Bheda (Eye gaze)", "Poetic lyrics"],
    roleInBharatanatyam: "Brings the dance to life in Varnam, Padam, and devotional compositions.",
    icon: Heart,
  },
  {
    id: "natya",
    name: "Natya",
    sanskrit: "नाट्य",
    tagline: "Dramatic Theatrical Storytelling",
    description:
      "Full theatrical enactment involving mythic characters, dialogues, costume (Aharya), and narrative dramatic representation.",
    components: ["Mythological lore", "Character enactment", "Theatrical dialogue", "Aharya (Costume)"],
    roleInBharatanatyam: "Connects solo dance to ancient Indian dramatic tradition codified in the Natya Shastra.",
    icon: Drama,
  },
];

export default function NrittaNrityaVisualizer({ className = "" }: { className?: string }) {
  const [selected, setSelected] = useState<"nritta" | "nritya" | "natya">("nritta");
  const active = TRIAD_DATA.find((t) => t.id === selected) || TRIAD_DATA[0];

  return (
    <div className={`rounded-2xl border border-card-border bg-card/80 p-5 shadow-sm text-foreground ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-foreground/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="serif text-[1rem] font-semibold text-foreground/95">
            The Three Dimensions of Indian Classical Dance (Natya Shastra)
          </h4>
        </div>
        <span className="mono text-[9px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          Conceptual Triad
        </span>
      </div>

      {/* Triad Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {TRIAD_DATA.map((t) => {
          const Icon = t.icon;
          const isSelected = t.id === selected;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary/15 border-primary/60 text-primary shadow-sm"
                  : "bg-foreground/5 border-foreground/10 text-foreground/70 hover:border-foreground/20 hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-foreground/50"}`} />
                <span className="serif text-xs font-serif opacity-75">{t.sanskrit}</span>
              </div>
              <h5 className="serif text-sm font-semibold leading-tight">{t.name}</h5>
              <p className="mono text-[9px] opacity-70 truncate mt-0.5">{t.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Element Detail Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
        <div className="flex items-baseline gap-2 mb-1.5">
          <h5 className="serif text-base font-bold text-primary">{active.name} ({active.sanskrit})</h5>
          <span className="mono text-[10px] uppercase tracking-wider text-foreground/50">
            — {active.tagline}
          </span>
        </div>

        <p className="serif text-[0.95rem] text-foreground/85 leading-relaxed mb-3">
          {active.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-foreground/8">
          <div>
            <span className="mono text-[9px] uppercase tracking-wider text-primary font-semibold block mb-1">
              Core Technical Components:
            </span>
            <ul className="space-y-1">
              {active.components.map((c, i) => (
                <li key={i} className="serif text-xs text-foreground/75 flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="mono text-[9px] uppercase tracking-wider text-primary font-semibold block mb-1">
              Function in Bharatanatyam:
            </span>
            <p className="serif text-xs text-foreground/75 leading-relaxed">
              {active.roleInBharatanatyam}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
