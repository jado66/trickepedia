"use client";

import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { disciplines } from "./discipline-data";

export function DisciplineCards() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Choose Your <span className="text-primary">Discipline</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Explore comprehensive trick databases for every action sport
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {disciplines.map((discipline, index) => {
            const isLastOdd =
              index === disciplines.length - 1 && disciplines.length % 2 === 1;
            return (
              <Link
                key={discipline.slug}
                href={`/${discipline.slug}`}
                className={`group ${
                  isLastOdd ? "sm:col-span-2 sm:max-w-2xl mx-auto w-full" : ""
                }`}
              >
                {/* Make the entire card the aspect container so the image fully covers it */}
                <Card className="group relative overflow-hidden aspect-[16/10] border-2 hover:border-primary transition-all duration-300">
                  <img
                    src={discipline.image || "/placeholder.svg"}
                    alt={discipline.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Color wash */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${discipline.color} opacity-60 group-hover:opacity-40 transition-opacity`}
                  />
                  {/* Dark bottom gradient for legible text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {discipline.name}
                    </h3>
                    <p className="text-white/90 text-lg mb-4 leading-relaxed">
                      {discipline.description}
                    </p>
                    <div className="inline-flex items-center text-white font-semibold group-hover:gap-3 gap-2 transition-all">
                      Explore Tricks
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
