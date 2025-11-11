"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useUser } from "@/contexts/user-provider";

interface AddTrickCardProps {
  categorySlug: string;
  subcategorySlug: string;
}

export function AddTrickCard({
  categorySlug,
  subcategorySlug,
}: AddTrickCardProps) {
  const { user } = useUser();

  return (
    <Link href={user ? `/${categorySlug}/${subcategorySlug}/new` : `/login`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-dashed border-2 border-muted-foreground/25 hover:border-primary/50">
        <div className="aspect-video relative overflow-hidden bg-muted/30 flex items-center justify-center">
          <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg leading-tight text-center">
            Add New Trick
          </CardTitle>
          <CardDescription className="text-sm text-center">
            Share your knowledge with the community
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
