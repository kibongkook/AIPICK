import {
  PenTool, Image, Video, Code, Music, BarChart3, Languages, Sparkles,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  PenTool,
  Image,
  Video,
  Code,
  Music,
  BarChart3,
  Languages,
  Sparkles,
};

interface DynamicIconProps {
  name: string;
  className?: string;
}

export default function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}
