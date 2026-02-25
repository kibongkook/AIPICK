import {
  PenTool, Image, Video, Code, Music, BarChart3, Languages, Sparkles, Lightbulb,
  Layout, Palette, Megaphone, Briefcase, Target,
  Baby, Smile, BookOpen, GraduationCap, School, Users,
  Trophy, TrendingUp, ArrowUp, ArrowDown, Minus,
  MessageSquare, Zap, BarChart, Presentation, Rocket,
  Heart, User, Building, Clapperboard, Headphones, Terminal,
  Globe, FileText, Search, Layers, MessageCircle,
  // tool_updates 아이콘
  Brain, DollarSign, Info,
  // 레시피 아이콘 추가분
  Smartphone, ShoppingBag, Film, Mic, Mail,
  Instagram, Newspaper, CreditCard, Youtube, Monitor,
  Paintbrush, Wand2, MonitorPlay, Puzzle,
  Grid2x2, ClipboardList, Sheet, GitCompare,
  Map, Utensils, Dumbbell, Calendar, PieChart,
  Frame, FileSignature,
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
  // tool_updates 아이콘
  Brain,
  DollarSign,
  Info,
  // 레시피 아이콘
  Smartphone,
  ShoppingBag,
  Film,
  Mic,
  Mail,
  Instagram,
  Newspaper,
  CreditCard,
  Youtube,
  Monitor,
  Paintbrush,
  Wand2,
  MonitorPlay,
  Puzzle,
  Grid: Grid2x2,
  ClipboardList,
  Sheet,
  GitCompare,
  Map,
  Utensils,
  Dumbbell,
  Calendar,
  PieChart,
  Frame,
  FileSignature,
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
