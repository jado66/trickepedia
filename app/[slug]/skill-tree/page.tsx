import { SkillTree } from "@/components/skill-tree";
import { getMasterCategoryBySlug } from "@/lib/server/categories-data-server";
import NotFoundComponent from "@/components/not-found";

interface SkillTreePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SkillTreePage({ params }: SkillTreePageProps) {
  const { slug } = await params;

  if (!slug) {
    return (
      <div className="text-center">
        <div className="text-center">No slug selected.</div>
      </div>
    );
  }

  // Check if the category exists
  const category = await getMasterCategoryBySlug(slug);

  if (!category) {
    return <NotFoundComponent />;
  }

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <div className="mx-auto h-full">
        <SkillTree selectedCategory={slug} />
      </div>
    </main>
  );
}
