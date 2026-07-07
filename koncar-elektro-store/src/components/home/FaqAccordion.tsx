import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { faqItems } from '@/data/homepage';

type Props = {
  variant?: 'dark' | 'light';
};

export const FaqAccordion = ({ variant = 'dark' }: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isLight = variant === 'light';

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <ul
      className={`faq-accordion divide-y ${
        isLight ? 'divide-border border-t border-border' : 'divide-white/10 border-t border-white/10'
      }`}
    >
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <li key={item.question}>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className={`w-full flex items-center justify-between gap-4 text-sm text-left py-3 transition-colors group ${
                isLight
                  ? isOpen
                    ? 'text-primary pb-1'
                    : 'text-foreground hover:text-primary py-3'
                  : isOpen
                    ? 'text-white pb-1'
                    : 'text-white/90 hover:text-white py-3'
              }`}
            >
              <span className="leading-snug pr-2">{item.question}</span>
              <span
                className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isOpen
                    ? 'border-accent text-accent'
                    : isLight
                      ? 'border-border group-hover:border-accent group-hover:text-accent'
                      : 'border-white/25 group-hover:border-accent group-hover:text-accent'
                }`}
              >
                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            {isOpen && (
              <p
                className={`text-xs leading-relaxed pb-3 pr-10 ${
                  isLight ? 'text-muted-foreground' : 'text-white/65'
                }`}
              >
                {item.answer}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};
