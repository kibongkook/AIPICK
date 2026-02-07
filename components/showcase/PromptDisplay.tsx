import { MessageSquareQuote } from 'lucide-react';

interface PromptDisplayProps {
  promptKo: string;
  prompt: string;
  description?: string;
}

export default function PromptDisplay({ promptKo, prompt, description }: PromptDisplayProps) {
  return (
    <div className="rounded-xl bg-gray-50 p-5 border-l-4 border-primary">
      <div className="flex items-start gap-3">
        <MessageSquareQuote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-base font-bold text-foreground leading-relaxed">
            &ldquo;{promptKo}&rdquo;
          </p>
          <p className="mt-1.5 text-xs text-gray-400 italic">{prompt}</p>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
