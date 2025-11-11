"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function MerchComingSoon() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set launch date to 30 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      {/* Just Kidding Section */}
      <div className="absolute top-0 left-0 w-full z-20">
        <div className="bg-yellow-100 text-yellow-900 border-b border-yellow-300 py-4 px-6 text-center shadow-md">
          <span className="font-bold">Just kidding!</span> We don&apos;t need to
          beg you for money. But you{" "}
          <span className="font-semibold">can contribute</span> by adding to our
          wiki, and buying merch if you&apos;d like. Thanks for being awesome!
        </div>
      </div>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-secondary/10 rounded-full blur-lg animate-pulse delay-500" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Main Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 text-balance">
            Exciting New
            <span className="block text-primary">Merchandise</span>
            <span className="block">Coming Soon!</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get ready for our exclusive collection of premium merchandise. Be
            the first to know when we launch!
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Launch Countdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item) => (
              <Card
                key={item.label}
                className="p-6 bg-card/80 backdrop-blur-sm border-border/50"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {item.value.toString().padStart(2, "0")}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {item.label}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Email Signup */}
        {/* <div className="mb-12">
          {!isSubscribed ? (
            <Card className="p-8 max-w-md mx-auto bg-card/80 backdrop-blur-sm border-border/50">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Get Notified!
              </h3>
              <p className="text-muted-foreground mb-6">
                Join our exclusive list and be the first to shop our new
                collection.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border focus:ring-primary"
                />
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                >
                  Notify Me When It's Ready!
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="p-8 max-w-md mx-auto bg-accent/10 backdrop-blur-sm border-accent/20">
              <div className="text-accent text-4xl mb-4">✓</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                You're All Set!
              </h3>
              <p className="text-muted-foreground">
                Thanks for signing up! We'll notify you as soon as our
                merchandise is available.
              </p>
            </Card>
          )}
        </div> */}

        {/* Social Media Links */}
        {/* <div className="flex justify-center space-x-6">
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="Follow us on Twitter"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="Follow us on Instagram"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.367-.315-.49-.753-.49-1.243 0-.49.123-.928.49-1.243.369-.367.807-.49 1.297-.49s.928.123 1.297.49c.367.315.49.753.49 1.243 0 .49-.123.928-.49 1.243-.369.315-.807.49-1.297.49z" />
            </svg>
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="Follow us on Facebook"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div> */}
      </div>
    </div>
  );
}
