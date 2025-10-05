"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

export function ContributorBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary/5 border-b border-primary/20 dark:bg-[#1f2a2d] dark:border-[#3a5461]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-base font-normal text-gray-900 dark:text-gray-100 mb-3">
              Calling all action sports enthusiasts,
            </h2>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              Trickipedia is powered by its passionate community of action
              sports enthusiasts. Anyone with an account can add and edit tricks
              across trampoline, tricking, parkour, trampwall, and more. Your
              knowledge and experience are essential to building the
              world&apos;s most comprehensive trick database. Every contribution
              makes a difference, no matter how small. Join us and help shape
              the future of Trickipedia!
            </p>

            <div className="flex flex-wrap gap-2">
              <Link href="/contribute">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-1.5 h-auto font-normal"
                >
                  Start contributing today
                </Button>
              </Link>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 h-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
