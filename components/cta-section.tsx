import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-orange-600">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-balance">
            Ready to Join the Action Sports Community?
          </h2>
          <p className="text-xl text-orange-100 text-pretty">
            Whether you&apos;re a beginner looking to start your journey or an
            experienced athlete seeking new challenges, Flipside has everything
            you need to connect, train, and grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/hubs">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-white text-white hover:bg-white hover:text-orange-600 bg-transparent"
              >
                Explore Hubs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
