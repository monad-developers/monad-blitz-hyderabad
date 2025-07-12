"use client";

import { useEffect, useRef, useState } from "react";
import { LucideIcon, Code2, BarChart3, LockKeyhole } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Code2,
  BarChart3,
  LockKeyhole,
};

export default function FeatureCard({
  step,
  title,
  desc,
  icon,
  delay,
}: {
  step: string;
  title: string;
  desc: string;
  icon: keyof typeof iconMap;
  delay: number;
}) {
  const Icon = iconMap[icon];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect(); // trigger once per card
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-gray-800 rounded-xl p-6 shadow-xl overflow-hidden transform transition-all duration-700
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{
        transitionDelay: `${visible ? delay : 0}ms`,
      }}
    >
      {/* Glow Border */}
      <div className="absolute inset-0 rounded-xl border border-purple-500 opacity-10 pointer-events-none"></div>

      {/* Icon */}
      <div className="flex justify-center items-center w-12 h-12 mb-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-md">
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Step */}
      <h4 className="text-lg font-semibold text-purple-400">{step}</h4>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mt-1">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-400 mt-2">{desc}</p>
    </div>
  );
}
