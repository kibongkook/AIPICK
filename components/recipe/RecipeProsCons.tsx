import { Check, AlertTriangle } from 'lucide-react';

interface RecipeProsConsProps {
  pros: string[];
  cons: string[];
}

export default function RecipeProsCons({ pros, cons }: RecipeProsConsProps) {
  if (pros.length === 0 && cons.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* 장점 */}
      {pros.length > 0 && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
          <h4 className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            장점
          </h4>
          <ul className="space-y-1">
            {pros.map((pro, i) => (
              <li key={i} className="text-xs text-emerald-700 leading-relaxed pl-4 relative">
                <span className="absolute left-0">·</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 단점 */}
      {cons.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <h4 className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            단점
          </h4>
          <ul className="space-y-1">
            {cons.map((con, i) => (
              <li key={i} className="text-xs text-red-600 leading-relaxed pl-4 relative">
                <span className="absolute left-0">·</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
