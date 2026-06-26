import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

type FaqItem = { question: string; answer: string };

type Props = {
  items: FaqItem[];
};

export const ProductFaqSection = ({ items }: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const midpoint = Math.ceil(items.length / 2);
  const columns = [items.slice(0, midpoint), items.slice(midpoint)];

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="product-section product-faq-section">
      <div className="container">
        <h2 className="product-section-title">Najčešća pitanja</h2>

        <div className="product-faq-grid">
          {columns.map((columnItems, colIdx) => (
            <ul key={colIdx} className="product-faq-panel">
              {columnItems.map((item, rowIdx) => {
                const index = colIdx === 0 ? rowIdx : rowIdx + midpoint;
                const isOpen = openIndex === index;

                return (
                  <li key={item.question}>
                    <button
                      type="button"
                      className="product-faq-trigger"
                      aria-expanded={isOpen}
                      onClick={() => toggle(index)}
                    >
                      <span className="product-faq-question">{item.question}</span>
                      <span className="product-faq-icon" aria-hidden>
                        {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="product-faq-answer">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
};
