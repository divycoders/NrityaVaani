import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Volume2 } from "lucide-react";
import GuruHeroPreview from "@/components/home/GuruHeroPreview";
import DancesIndex from "@/components/home/DancesIndex";
import HandsShowcase from "@/components/home/HandsShowcase";
import {
  Eyebrow,
  FactStrip,
  Figure,
  FigureRow,
  Headline,
  Mark,
  Pill,
  Prose,
  Rule,
  Section,
} from "@/components/ui/editorial";

/*
 * Nataraja — the Lord of Dance — stands behind the hero and resolves as you
 * scroll: a flat 2D silhouette, then a hairline drawing, then the fully lit
 * bronze figure. It is the one motif shared by all seven forms.
 */
const NatarajaStage = dynamic(() => import("@/components/three/NatarajaStage"));

export default function LandingPage() {
  return (
    <div className="relative selection:bg-primary/30 selection:text-primary">
      {/* Fixed stage behind page */}
      <NatarajaStage className="fixed inset-0 z-0 pointer-events-none" />

      {/* ---------------------------------------------------------------- hero */}
      <section className="relative z-10 min-h-[100svh] flex items-center overflow-hidden px-6 pt-28 pb-20 md:pt-24 lg:pt-20 lg:pb-12">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-background/70 to-transparent lg:via-background/50" />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-12 lg:gap-10 items-center">
            {/* Left — Teaching-First Value Proposition */}
            <div className="max-w-xl">
              <Eyebrow tone="primary" className="mb-6">
                classical dance · 3d virtual guru
              </Eyebrow>

              <h1 className="serif font-normal tracking-[-0.015em] leading-[1.06] text-[clamp(2.3rem,5.5vw,4.2rem)] text-foreground">
                Learn Bharatanatyam with an interactive <Mark>3D Virtual Guru</Mark>.
              </h1>

              <Prose className="mt-7">
                <p>
                  Master foundational adavus, mudras, and rhythm step-by-step from an interactive 3D
                  Guru dressed in authentic Aharya Abhinaya. Experience guided teaching with
                  15 vernacular Indian voice personas across 12 languages — at your own pace, on
                  any screen, with zero camera requirements.
                </p>
              </Prose>

              <div className="mt-9 flex flex-wrap gap-3">
                <Pill href="/learn" variant="solid" className="px-8 py-4 text-xs font-semibold">
                  Start Learning
                </Pill>
                <Pill href="/learn/bharatanatyam/namaskaram" className="px-7 py-4 text-xs">
                  Try Lesson 1: Namaskaram
                </Pill>
              </div>

              <FactStrip
                className="mt-11"
                items={[
                  "3D Virtual Guru",
                  "12 Indian Languages",
                  "Step-by-Step Curriculum",
                  "Camera-Free Learning",
                ]}
              />
            </div>

            {/* Right — Interactive 3D Guru Preview */}
            <GuruHeroPreview />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- beginner curriculum preview */}
      <Section id="curriculum" ruled className="z-10 bg-background/95 backdrop-blur-sm border-t border-foreground/12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-end">
          <div>
            <Eyebrow tone="primary">the curriculum</Eyebrow>
            <Headline as="h2" className="mt-4">
              A structured path from your <Mark>very first step</Mark>.
            </Headline>
          </div>
          <Prose>
            <p>
              Classical Bharatanatyam begins with reverence, posture, and rhythm. You do not need
              prior training or camera setup — simply open any lesson to study each movement alongside
              the 3D Virtual Guru, inspect the choreography from any angle, and repeat at your own speed.
            </p>
          </Prose>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {/* Lesson 1 Card */}
          <div className="group rounded-2xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  Part 01 · Beginner
                </span>
                <span className="mono text-[10px] text-foreground/45 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 1m 27s
                </span>
              </div>
              <h3 className="serif text-[1.45rem] leading-tight text-foreground/95 mt-3 group-hover:text-primary transition-colors">
                Namaskaram
              </h3>
              <p className="serif italic text-[0.92rem] text-foreground/60 mt-1">
                Salutation to Mother Earth, the Divine & Guru
              </p>
              <p className="serif text-[0.98rem] leading-[1.58] text-foreground/75 mt-4">
                The foundational ritual performed before every practice and performance. Teaches
                sacred intent, Aramandi balance, and Anjali mudra coordination.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/65 border border-foreground/10">
                  11 Detailed Steps
                </span>
                <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/65 border border-foreground/10">
                  Pataka & Tripataka
                </span>
                <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  <Volume2 className="h-2.5 w-2.5" /> Narrated
                </span>
              </div>
            </div>

            <Link
              href="/learn/bharatanatyam/namaskaram"
              className="mono mt-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-primary group-hover:gap-3 transition-all font-medium"
            >
              Start Part 1 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Lesson 2 Card */}
          <div className="group rounded-2xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  Part 02 · Beginner
                </span>
                <span className="mono text-[10px] text-foreground/45 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 0m 45s
                </span>
              </div>
              <h3 className="serif text-[1.45rem] leading-tight text-foreground/95 mt-3 group-hover:text-primary transition-colors">
                Thattadavu
              </h3>
              <p className="serif italic text-[0.92rem] text-foreground/60 mt-1">
                Foundational Rhythm & Flat-Foot Stamping
              </p>
              <p className="serif text-[0.98rem] leading-[1.58] text-foreground/75 mt-4">
                The first adavu family: rhythmic foot stamping in the grounded Aramandi posture.
                Teaches the spine-weight connection and steady counting in Adi Tala.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/65 border border-foreground/10">
                  4 Rhythmic Steps
                </span>
                <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/65 border border-foreground/10">
                  Aramandi Posture
                </span>
                <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  <Volume2 className="h-2.5 w-2.5" /> Narrated
                </span>
              </div>
            </div>

            <Link
              href="/learn/bharatanatyam/thattadavu"
              className="mono mt-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-primary group-hover:gap-3 transition-all font-medium"
            >
              Start Part 2 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Mudra Vocabulary Card */}
          <div className="group rounded-2xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  Vocabulary · Reference
                </span>
                <span className="mono text-[10px] text-foreground/45 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> 28 Hastas
                </span>
              </div>
              <h3 className="serif text-[1.45rem] leading-tight text-foreground/95 mt-3 group-hover:text-primary transition-colors">
                Asamyukta Hastas
              </h3>
              <p className="serif italic text-[0.92rem] text-foreground/60 mt-1">
                The 28 Single-Hand Classical Mudras
              </p>
              <p className="serif text-[0.98rem] leading-[1.58] text-foreground/75 mt-4">
                Explore every single-hand gesture documented in the Abhinaya Darpana with interactive
                3D hand models, Sanskrit meanings, finger placement rules, and common errors.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/65 border border-foreground/10">
                  Interactive 3D Hand
                </span>
                <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/65 border border-foreground/10">
                  Abhinaya Darpana
                </span>
              </div>
            </div>

            <Link
              href="/library"
              className="mono mt-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-primary group-hover:gap-3 transition-all font-medium"
            >
              Browse Library <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- the hands */}
      <Section id="hands" className="relative z-10 bg-background border-t border-foreground/12">
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow tone="primary">the hands</Eyebrow>
            <Headline className="mt-5">
              A language of the hands, <Mark>formed in three dimensions</Mark>.
            </Headline>
            <Prose className="mt-8">
              <p>
                Bharatanatyam tells its stories through hasta mudras — a flag, a peacock, a
                blooming lotus. The hand here forms eight of them in turn: pick a name to see it
                again, or move your pointer to turn the hand.
              </p>
              <p>
                <strong>All twenty-eight are documented in the library</strong>, each with its
                origin, meaning, and precise hand geometry. You can study each hand pose in 3D
                without ever needing a camera.
              </p>
            </Prose>
            <div className="mt-10 flex flex-wrap gap-3">
              <Pill href="/library" variant="solid">
                Explore Mudra Library
              </Pill>
              <Pill href="/practice">Optional Practice Coach</Pill>
            </div>
          </div>

          <HandsShowcase className="max-w-[34rem] mx-auto lg:mx-0 lg:justify-self-end" />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- how learning works */}
      <Section ruled className="z-10 bg-background">
        <Eyebrow tone="primary">how it works</Eyebrow>
        <Headline className="mt-5 max-w-3xl">
          Four pillars of <Mark>teaching-first learning</Mark>.
        </Headline>

        <ol className="mt-14 md:mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {[
            {
              n: "01",
              title: "3D Demonstration",
              body: "Watch the 3D Guru in full Aharya Abhinaya. Orbit 360°, switch view framing (Full Body, Abhinaya Face, Mudras, Feet), and slow to 0.5x to inspect every nuance.",
              href: "/learn",
              link: "The lessons",
            },
            {
              n: "02",
              title: "Vernacular Voice",
              body: "Hear authentic spoken cues, bols, and shlokas in English, Hindi, Tamil, Telugu, and 8 more Indian languages powered by Goonj neural audio synthesis.",
              href: "/learn/bharatanatyam/namaskaram",
              link: "Hear in player",
            },
            {
              n: "03",
              title: "Step-by-Step",
              body: "Every movement is broken into clear pedagogical steps with exact tala rhythm, poetic gloss, and postural cues. Loop any step until it feels natural.",
              href: "/learn/bharatanatyam",
              link: "Bharatanatyam parts",
            },
            {
              n: "04",
              title: "Optional Practice",
              body: "Camera evaluation is completely optional. When you wish to self-test, on-device MediaPipe assesses your hand posture with zero video leaving your machine.",
              href: "/practice",
              link: "Optional practice",
            },
          ].map((step) => (
            <li key={step.n}>
              <Rule className="mb-6" />
              <div className="flex items-baseline gap-4">
                <span className="mono text-[11px] text-primary tabular-nums">{step.n}</span>
                <h3 className="serif text-[1.4rem] leading-none tracking-tight">{step.title}</h3>
              </div>
              <p className="serif text-[0.98rem] leading-[1.62] text-foreground/70 mt-5">
                {step.body}
              </p>
              <Link
                href={step.href}
                className="mono mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-primary hover:gap-3 transition-all font-medium"
              >
                {step.link}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------------------------------------------------------------- the lineage */}
      <section id="lineage" className="relative z-10 border-t border-foreground/12">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />

        <div className="relative min-h-[120vh]">
          <div className="sticky top-0 min-h-screen flex items-center px-6 py-28">
            <div className="max-w-6xl mx-auto w-full">
              <div className="max-w-2xl">
                <Eyebrow tone="primary">the lineage</Eyebrow>
                <h2 className="serif font-normal tracking-[-0.015em] leading-[1.08] text-[clamp(1.9rem,4.4vw,3.4rem)] mt-5 text-foreground">
                  A tradition <Mark>two thousand years old</Mark>, learned by repetition.
                </h2>
                <div className="serif text-[1.02rem] sm:text-[1.09rem] leading-[1.66] text-foreground/70 max-w-[62ch] space-y-4 mt-8">
                  <p>
                    Every classical form traces back to the Natya Shastra — a single foundational
                    text that set down how the hands, the eyes, and the body carry meaning. What
                    changes from one state to the next is only the accent: how the knee bends,
                    how the beat lands, how the face is painted.
                  </p>
                  <p>
                    <strong className="font-semibold text-foreground">
                      Nothing here tries to replace the living Guru.
                    </strong>{" "}
                    NrityaVaani offers a quiet practice room for when you are alone: an interactive 3D
                    master that repeats as many times as you need, explaining each hand and foot movement
                    patiently in your mother tongue.
                  </p>
                </div>
                <div className="mt-10">
                  <Pill href="/about" variant="ghost">
                    About the project
                  </Pill>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- the forms */}
      <DancesIndex />

      {/* ---------------------------------------------------------------- technology & privacy */}
      <div id="technology" className="relative z-10 border-t border-foreground/12">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent pointer-events-none" />
        <Section className="relative">
          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] gap-10 lg:gap-16">
            <div>
              <Eyebrow tone="primary">technology & privacy</Eyebrow>
              <Headline className="mt-5">
                Honest geometry, private learning, and <Mark>zero video uploaded</Mark>.
              </Headline>
            </div>
            <Prose>
              <p>
                NrityaVaani prioritizes teaching first: the 3D Guru renders entirely in WebGL
                within your browser, with synchronised audio generated by high-fidelity neural voices.
              </p>
              <p>
                When you choose to open optional camera self-practice, vision inference runs
                locally via Google MediaPipe. Rather than relying on opaque confidence scores,
                our geometric rules evaluate exact finger joint angles and distance ratios. No frame of
                video ever touches a remote server.
              </p>
            </Prose>
          </div>

          <FigureRow className="mt-16 md:mt-20">
            <Figure value="28" caption="hasta mudras in 3D" />
            <Figure value="12" caption="Indian languages supported" />
            <Figure value="0" unit="frames" caption="uploaded to any server" />
            <Figure value="100%" caption="on-device privacy" />
          </FigureRow>
        </Section>
      </div>

      {/* ---------------------------------------------------------------- close */}
      <Section ruled className="z-10 bg-background pb-28 md:pb-36">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-10 lg:gap-16 items-end">
          <Headline className="max-w-2xl">
            Begin your journey in classical dance with the <Mark>3D Virtual Guru</Mark>.
          </Headline>
          <div className="flex flex-wrap gap-3">
            <Pill href="/learn" variant="solid">
              Start Learning
            </Pill>
            <Pill href="/library">Explore Mudra Library</Pill>
          </div>
        </div>
        <FactStrip
          className="mt-14"
          items={[
            "Classical Bharatanatyam",
            "Interactive 3D Guru",
            "Zero Camera Requirement",
            "On-Device Privacy",
          ]}
        />
      </Section>
    </div>
  );
}
