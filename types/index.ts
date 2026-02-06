// ==========================================
// AIPICK 타입 정의
// DB 스키마와 1:1 매핑
// ==========================================

export type PricingType = 'Free' | 'Freemium' | 'Paid';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  category_id: string;
  url: string;
  logo_url: string | null;
  pricing_type: PricingType;
  free_quota_detail: string | null;
  monthly_price: string | null;
  rating_avg: number;
  review_count: number;
  visit_count: number;
  tags: string[];
  is_editor_pick: boolean;
  supports_korean: boolean;
  pros: string[];
  cons: string[];
  created_at: string;
  updated_at: string;
}

export interface ToolWithCategory extends Tool {
  category: Category;
}

export interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export interface News {
  id: string;
  title: string;
  summary: string | null;
  source_url: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}
