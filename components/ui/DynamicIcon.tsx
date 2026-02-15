import {
  PenTool, Image, Video, Code, Music, BarChart3, Languages, Sparkles, Lightbulb,
  Layout, Palette, Megaphone, Briefcase, Target,
  Baby, Smile, BookOpen, GraduationCap, School, Users,
  Trophy, TrendingUp, ArrowUp, ArrowDown, Minus,
  MessageSquare, Zap, BarChart, Presentation, Rocket,
  Heart, User, Building, Clapperboard, Headphones, Terminal,
  Globe, FileText, Search, Layers, MessageCircle,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  PenTool,
  Image,
  Video,
  Code,
  Music,
  BarChart3,
  BarChart,
  Languages,
  Sparkles,
  Lightbulb,
  Layout,
  Palette,
  Megaphone,
  Briefcase,
  Target,
  Baby,
  Smile,
  BookOpen,
  GraduationCap,
  School,
  Users,
  Trophy,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  MessageSquare,
  Zap,
  Presentation,
  Rocket,
  Heart,
  User,
  Building,
  Clapperboard,
  Headphones,
  Terminal,
  Globe,
  FileText,
  Search,
  Layers,
  MessageCircle,
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
