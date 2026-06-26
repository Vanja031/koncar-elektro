import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { FaqEntry } from '@/data/staticPages';

type Props = {
  items: FaqEntry[];
};

export const StaticFaqAccordion = ({ items }: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border border border-border rounded-xl bg-white overflow-hidden shadow-sm">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-secondary/40 transition-colors"
            >
              <span className="font-display font-semibold text-sm text-primary leading-snug pr-2">
                {item.question}
              </span>
              <span
                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isOpen ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground'
                }`}
              >
                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            {isOpen && (
              <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
