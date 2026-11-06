import type { LucideIcon } from 'lucide-react';

interface IconProps {
  /** Lucide icon component supplied by the caller. */
  iconNode?: LucideIcon | null;
  className?: string;
}

/** Project-native equivalent of the Elite icon wrapper, using the app's Lucide icon set. */
export function Icon({ iconNode: IconComponent, className }: IconProps) {
  if (!IconComponent) return null;
  return <IconComponent className={className} aria-hidden="true" />;
}
