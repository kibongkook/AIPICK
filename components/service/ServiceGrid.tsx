import type { Tool } from '@/types';
import ServiceCard from './ServiceCard';

interface ServiceGridProps {
  tools: Tool[];
  columns?: 1 | 2 | 3 | 4;
  compact?: boolean;
}

export default function ServiceGrid({ tools, columns = 2, compact = false }: ServiceGridProps) {
  const gridCols = columns === 1
    ? 'grid-cols-1'
    : columns === 3
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : columns === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={`grid gap-3 ${gridCols}`}>
      {tools.map((tool) => (
        <ServiceCard key={tool.id} tool={tool} compact={compact} />
      ))}
    </div>
  );
}
