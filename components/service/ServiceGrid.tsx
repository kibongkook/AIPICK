import type { Tool } from '@/types';
import ServiceCard from './ServiceCard';

interface ServiceGridProps {
  tools: Tool[];
  columns?: 3 | 4;
}

export default function ServiceGrid({ tools, columns = 4 }: ServiceGridProps) {
  const gridCols = columns === 3
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {tools.map((tool) => (
        <ServiceCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
