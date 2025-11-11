"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-orange-200 to-orange-500 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                Connect with the{" "}
                <span className="text-orange-600">Action Sports</span> Community
              </h1>
              <p className="text-xl text-background text-pretty leading-relaxed">
                Find local hubs, join events, and connect with athletes in
                parkour, trampoline, tricking, and more. Build your training
                schedule and grow with the community.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/hubs">
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-lg px-8"
                >
                  Find Hubs Near You
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-transparent"
                >
                  Browse Events
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-background">Training Hubs</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold">200+</div>
                <div className="text-sm text-background">Monthly Events</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-sm text-background">Athletes</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1572417051886-c16f1253a604?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Action sports athlete performing parkour"
                className="object-cover w-full h-full absolute inset-0"
                style={{ objectFit: "cover", objectPosition: "center 0%" }}
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-background">
                    Next Session
                  </div>
                  <div className="text-sm text-background">
                    Wednesday 7:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
