import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/supabase/queries';

/** GET /api/categories - 카테고리 목록 조회 */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
