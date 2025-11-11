"use client";

import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "The skill trees are game-changing. I can finally see exactly what I need to learn next and track my progression visually.",
    author: "JD Erwin",
    role: "Parkour Athlete",
    avatar: "https://static.diverseui.com/male-87.jpg",
  },
  {
    quote:
      "As a beginner, this is exactly what I needed. Clear tutorials, prerequisites shown, and a supportive community.",
    author: "Kory Cross",
    role: "Tricking Beginner",
    avatar:
      "https://scontent-den2-1.cdninstagram.com/v/t51.2885-19/503496620_18083867194742429_8528089020318353295_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-den2-1.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2QFlh3Sq4u9ydR_S2cbTSPON4xjVI16FgZWmfTGoplrujI5713DKxadXYm7jo2Xp6HI&_nc_ohc=i3x0fiOfJL8Q7kNvwG7Uqki&_nc_gid=4g8XDZ-J07tUDb2AyunmoQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfceTwpEItNeeuG3HBI4W4uwrU2ykB3nZ1MOzbaLc8_rzQ&oe=68E6695E&_nc_sid=7a9f4b",
  },
  {
    quote:
      "I've been tricking for 5 years and still discover new tricks here. The database is comprehensive and constantly growing.",
    author: "Jordan Lee",
    role: "Pro Tricker",
    avatar: "/placeholder.svg?height=80&width=80",
  },
];

export function CommunityProof() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Trusted by Athletes <span className="text-primary">Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Join thousands of athletes leveling up their skills every day
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.author}
              className="p-8 border-2 hover:border-primary/50 transition-all"
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              <p className="text-lg mb-6 leading-relaxed text-pretty">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
