"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";
export function DonorBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#fef6e7] border-b border-[#f8cc8b] dark:bg-[#2d2a1f] dark:border-[#54524a]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-base font-normal text-gray-900 dark:text-gray-100 mb-3">
              To all our readers in the US,
            </h2>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              It&apos;s a little awkward, so we&apos;ll get straight to the
              point: This week we ask our readers to help us. To protect our
              independence, we&apos;ll never run ads. We survive on donations
              averaging about $15. Only a tiny portion of our readers give. If
              everyone reading this right now gave $2.75, our fundraiser would
              be done within an hour. That&apos;s right, the price of a cup of
              coffee is all we need. We&apos;re a small non-profit with costs of
              a top website: servers, staff and programs. Trikipedia is
              something special. It is like a library or a public park where we
              can all go to learn. If Trikipedia is useful to you, please take
              one minute to keep it online and ad-free. Thank you.
            </p>

            <div className="flex flex-wrap gap-2">
              <Link href="/store">
                <Button
                  size="sm"
                  className="bg-[#0645ad] hover:bg-[#0b0080] text-white text-xs px-3 py-1 h-auto font-normal"
                >
                  $2.75
                </Button>
              </Link>
              <Link href="/store">
                <Button
                  size="sm"
                  className="bg-[#0645ad] hover:bg-[#0b0080] text-white text-xs px-3 py-1 h-auto font-normal"
                >
                  $5
                </Button>
              </Link>
              <Link href="/store">
                <Button
                  size="sm"
                  className="bg-[#0645ad] hover:bg-[#0b0080] text-white text-xs px-3 py-1 h-auto font-normal"
                >
                  $10
                </Button>
              </Link>
              <Link href="/store">
                <Button
                  size="sm"
                  className="bg-[#0645ad] hover:bg-[#0b0080] text-white text-xs px-3 py-1 h-auto font-normal"
                >
                  $20
                </Button>
              </Link>
              <Link href="/store">
                <Button
                  size="sm"
                  className="bg-[#0645ad] hover:bg-[#0b0080] text-white text-xs px-3 py-1 h-auto font-normal"
                >
                  Other
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
