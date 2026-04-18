import { ShieldCheck, Clock, Star, MapPin } from 'lucide-react';

const items = [
  { icon: ShieldCheck, label: 'Réparateurs certifiés' },
  { icon: Clock, label: 'Intervention rapide' },
  { icon: Star, label: '4.8/5 en moyenne' },
  { icon: MapPin, label: 'Partout en France' },
];

const TrustBar = () => (
  <div
    className="border-y border-border bg-surface-1"
    role="region"
    aria-label="Nos garanties"
  >
    <div className="container py-3">
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default TrustBar;
