import { Sparkles } from 'lucide-react';
import { getCategoryShowcase, getToolShowcasesByCategory } from '@/lib/supabase/queries';
import PromptDisplay from './PromptDisplay';
import ShowcaseGallery from './ShowcaseGallery';

interface ShowcaseSectionProps {
  categorySlug: string;
}

export default async function ShowcaseSection({ categorySlug }: ShowcaseSectionProps) {
  const showcase = await getCategoryShowcase(categorySlug);
  if (!showcase) return null;

  const items = await getToolShowcasesByCategory(categorySlug);
  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">같은 프롬프트, 다른 결과</h2>
      </div>
      <PromptDisplay
        promptKo={showcase.prompt_ko}
        prompt={showcase.prompt}
        description={showcase.description}
      />
      <div className="mt-4">
        <ShowcaseGallery items={items} mediaType={showcase.media_type} />
      </div>
    </section>
  );
}
