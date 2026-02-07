import { Lightbulb } from 'lucide-react';
import { getRoleShowcase, getRoleUseCases } from '@/lib/supabase/queries';
import UseCaseCard from './UseCaseCard';

interface RoleShowcaseSectionProps {
  targetType: 'job' | 'education';
  targetSlug: string;
}

export default async function RoleShowcaseSection({ targetType, targetSlug }: RoleShowcaseSectionProps) {
  const showcase = await getRoleShowcase(targetType, targetSlug);
  if (!showcase) return null;

  const useCases = await getRoleUseCases(showcase.id);
  if (useCases.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-foreground">{showcase.title}</h2>
        </div>
        <p className="text-sm text-gray-500">{showcase.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((uc) => (
          <UseCaseCard key={uc.id} useCase={uc} />
        ))}
      </div>
    </section>
  );
}
