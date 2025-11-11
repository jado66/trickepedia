import Link from "next/link";
import { TrickWithLinkedPrerequisites } from "@/types/trick";
import { renderMultilineDescription } from "@/lib/description-format";

interface TrickHeaderProps {
  trick: TrickWithLinkedPrerequisites;
  category: { name: string; slug: string };
}
export function TrickHeader({ trick, category }: TrickHeaderProps) {
  return (
    <>
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 lg:p-4 bg-muted/30 rounded-lg">
        <Link
          href={`/${category.slug}/${trick.subcategory?.slug}`}
          className="hover:text-primary transition-colors font-medium"
        >
          {category.name}
        </Link>
        <span className="text-muted-foreground/60">/</span>
        <Link
          href={`/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}`}
          className="hover:text-primary transition-colors font-medium"
        >
          {trick.subcategory?.name}
        </Link>
        <span className="text-muted-foreground/60">/</span>
        <span className="text-foreground font-medium">{trick.name}</span>
      </nav>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-balance mb-4 leading-tight">
            {trick.name}
          </h1>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            {renderMultilineDescription(trick?.description, {
              fallback: "No description available.",
            })}
          </p>
        </div>
      </div>
    </>
  );
}
