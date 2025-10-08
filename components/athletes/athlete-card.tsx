import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Athlete } from "@/lib/types/athlete";

interface AthleteCardProps {
  athlete: Athlete;
}

const getStatusBadge = (status: string) => {
  const badges = {
    active: {
      label: "COMPETING",
      className: "bg-primary text-primary-foreground",
    },
    retired: { label: "RETIRED", className: "bg-muted text-muted-foreground" },
    injured: {
      label: "INJURED",
      className: "bg-destructive text-destructive-foreground",
    },
    inactive: {
      label: "INACTIVE",
      className: "bg-secondary text-secondary-foreground",
    },
  };
  return badges[status as keyof typeof badges] || badges.active;
};

export function AthleteCard({ athlete }: AthleteCardProps) {
  const statusBadge = getStatusBadge(athlete.status);

  return (
    <Link href={`/athletes/${athlete.slug}`} className="group block">
      <div className="relative h-80 overflow-hidden rounded-lg bg-card border border-border transition-all duration-300 hover:border-primary">
        {/* Background Image */}
        <div className="absolute inset-0">
          {athlete.profile_image_url ? (
            <img
              src={athlete.profile_image_url}
              alt={athlete.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              // onError={(e) => {
              //   (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
              // }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className={`${statusBadge.className} font-mono text-xs tracking-wider`}
          >
            {statusBadge.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-balance group-hover:text-primary transition-colors">
              {athlete.name.toUpperCase()}
            </h3>

            {athlete.sport_categories &&
              athlete.sport_categories.length > 0 && (
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {athlete.sport_categories.map((c) => c.name).join(" • ")}
                </p>
              )}

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2">
              {athlete.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{athlete.country}</span>
                </div>
              )}
              {athlete.years_experience && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  <span>{athlete.years_experience} years pro</span>
                </div>
              )}
            </div>

            {athlete.sponsors && athlete.sponsors.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {athlete.sponsors.slice(0, 3).map((sponsor, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-background/50 backdrop-blur"
                  >
                    {sponsor}
                  </Badge>
                ))}
                {athlete.sponsors.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-background/50 backdrop-blur"
                  >
                    +{athlete.sponsors.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
