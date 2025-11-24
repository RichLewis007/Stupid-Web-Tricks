import { Layers, Loader2, Sparkles, Terminal, Triangle, type LucideIcon } from 'lucide-react';

type IconName = 'html' | 'css' | 'js' | 'svg' | 'webgl' | 'coming';

const iconMap: Record<IconName, LucideIcon> = {
  html: Terminal,
  css: Layers,
  js: Sparkles,
  svg: Triangle,
  webgl: Loader2,
  coming: Sparkles,
};

export interface CategoryCardProps {
  title: string;
  description: string;
  icon: IconName;
  iconClass?: string;
  href: string;
  features?: string[];
}

export function CategoryCard({
  title,
  description,
  icon,
  iconClass = '',
  href,
  features = [],
}: CategoryCardProps) {
  const Icon = iconMap[icon];

  return (
    <div className="category-card group">
      <div className="card-inner">
        <div className="card-front">
          <div className={`card-icon ${iconClass}`}>
            <Icon size={32} aria-hidden="true" />
          </div>
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
        </div>
        <div className="card-back">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <ul className="text-sm space-y-2">
            {features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
          <a
            href={href}
            className="mt-4 inline-block bg-white text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Explore →
          </a>
        </div>
      </div>
    </div>
  );
}

export default CategoryCard;
