import type { Tool, ToolShowcase, ShowcaseMediaType } from '@/types';
import ShowcaseCard from './ShowcaseCard';

interface ShowcaseGalleryProps {
  items: (ToolShowcase & { tool?: Tool })[];
  mediaType: ShowcaseMediaType;
}

export default function ShowcaseGallery({ items, mediaType }: ShowcaseGalleryProps) {
  if (items.length === 0) return null;

  const gridCols = mediaType === 'code'
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';

  return (
    <div className={`grid gap-3 ${gridCols}`}>
      {items.map((item) => (
        <ShowcaseCard
          key={item.id}
          toolSlug={item.tool_slug}
          toolName={item.tool?.name}
          toolLogoUrl={item.tool?.logo_url}
          mediaType={mediaType}
          resultImageUrl={item.result_image_url}
          resultText={item.result_text}
          resultDescription={item.result_description}
        />
      ))}
    </div>
  );
}
