"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
} from "../components/ui/resizable-navbar";
import FeatureCard from "../components/FeatureCard";
import Aurora from "../components/ui/Aurora/Aurora";

export default function Home() {
  const navItems = [
    { name: "Home", link: "#" },
    { name: "Features", link: "#features" },
    { name: "About", link: "#about" },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10">
        <Aurora />
      </div>

      {/* NAVBAR — keep outside of relative wrapper */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <NavbarButton href="#get-started">Get Started</NavbarButton>
        </NavBody>
      </Navbar>

      {/* Foreground content */}
      <div className="relative z-10">
        {/* HERO */}
        <section
          id="hero"
          className="relative h-screen flex flex-col justify-center items-center text-center px-6"
        >
          <h1 className="text-7xl font-black tracking-tight z-10 animate-hero-fade">
            NFT Terminal
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-200 z-10 animate-hero-fade-delay">
            Powering creators & communities — mint, gate & grow NFTs with zero-code on Monad.
          </p>
          <button className="mt-8 px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 rounded-full shadow-lg text-black text-lg font-semibold z-10 animate-hero-fade-delay">
            Get Started
          </button>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="py-24 px-6"
        >
          <h2 className="text-4xl font-bold text-center mb-12">
            What you can do with NFT Terminal
          </h2>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              step="01"
              icon="Code2"
              title="Strategic Assessment"
              desc="Our team assesses your platform’s legal architecture, operational model, and regulatory exposure."
              delay={0}
            />
            <FeatureCard
              step="02"
              icon="BarChart3"
              title="Implementation"
              desc="The legal strategy is executed end-to-end — preparing and submitting documents."
              delay={150}
            />
            <FeatureCard
              step="03"
              icon="LockKeyhole"
              title="Long-Term Support"
              desc="Continuous legal guidance and rapid turnaround as regulations shift and your operations scale."
              delay={300}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
