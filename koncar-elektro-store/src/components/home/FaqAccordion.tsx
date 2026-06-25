import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { faqItems } from '@/data/homepage';

export const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <ul className="faq-accordion divide-y divide-white/10 border-t border-white/10">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <li key={item.question}>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className={`w-full flex items-center justify-between gap-4 text-sm text-left py-3 transition-colors group ${
                isOpen ? 'text-white pb-1' : 'text-white/90 hover:text-white py-3'
              }`}
            >
              <span className="leading-snug pr-2">{item.question}</span>
              <span
                className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isOpen
                    ? 'border-accent text-accent'
                    : 'border-white/25 group-hover:border-accent group-hover:text-accent'
                }`}
              >
                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            {isOpen && (
              <p className="text-xs text-white/65 leading-relaxed pb-3 pr-10">{item.answer}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
};
