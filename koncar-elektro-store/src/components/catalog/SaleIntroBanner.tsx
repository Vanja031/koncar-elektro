import { Clock, Percent } from 'lucide-react';

type Props = {
  maxDiscount: number;
};

export const SaleIntroBanner = ({ maxDiscount }: Props) => (
  <section className="border-b border-border bg-gradient-to-br from-secondary/50 via-white to-accent/5">
    <div className="container py-6 md:py-7">
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5 lg:gap-8">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive mb-2">
            Ograničena ponuda
          </p>
          <h2 className="font-display font-bold text-xl md:text-2xl text-primary uppercase leading-tight mb-2">
            Najveći popusti trenutno
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Ponuda sortirana po uštedi — prvo artikli sa najvišim popustom.
            Iskoristite akcijske cene dok traju zalihe.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:w-[min(100%,16rem)] shrink-0">
          <div className="sale-stat-card sale-stat-card--accent">
            <Percent className="w-4 h-4 text-primary mb-2" strokeWidth={1.75} />
            <p className="font-display font-bold text-lg md:text-xl text-primary leading-none">-{maxDiscount}%</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">Max popust</p>
          </div>
          <div className="sale-stat-card">
            <Clock className="w-4 h-4 text-destructive mb-2" strokeWidth={1.75} />
            <p className="font-display font-bold text-sm md:text-base text-primary leading-tight">Dok traju</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">zalihe</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
