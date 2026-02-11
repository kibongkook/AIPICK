/**
 * seed-to-supabase.ts
 *
 * seed.json 데이터를 Supabase tools/categories 테이블로 초기 마이그레이션합니다.
 * Supabase 설정 후 최초 1회 실행하여 seed 데이터를 DB로 이전합니다.
 *
 * 사용법:
 *   npx tsx scripts/seed-to-supabase.ts
 *
 * 환경변수 필요:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import { createClient } from '@supabase/supabase-js';
import seedData from '../data/seed.json';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('=== AIPICK Seed → Supabase Migration ===\n');

  // 1. 카테고리 마이그레이션
  console.log('1. Migrating categories...');
  const categories = (seedData as Record<string, unknown>).categories as Array<Record<string, unknown>>;

  const { error: catError, data: catData } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' });

  if (catError) {
    console.error('  Category error:', catError.message);
  } else {
    console.log(`  ✓ ${categories.length} categories migrated`);
  }

  // 2. 도구 마이그레이션
  console.log('\n2. Migrating tools...');
  const tools = (seedData as Record<string, unknown>).tools as Array<Record<string, unknown>>;

  let toolSuccess = 0;
  let toolError = 0;

  // 50개씩 배치 처리
  const batchSize = 50;
  for (let i = 0; i < tools.length; i += batchSize) {
    const batch = tools.slice(i, i + batchSize);
    const { error } = await supabase
      .from('tools')
      .upsert(batch, { onConflict: 'slug' });

    if (error) {
      console.error(`  Batch ${i / batchSize + 1} error:`, error.message);
      toolError += batch.length;
    } else {
      toolSuccess += batch.length;
    }
  }

  console.log(`  ✓ ${toolSuccess} tools migrated, ${toolError} errors`);

  // 3. 사용자 타입 마이그레이션
  const userTypes = (seedData as Record<string, unknown>).user_types as Array<Record<string, unknown>> | undefined;
  if (userTypes?.length) {
    console.log('\n3. Migrating user types...');
    const { error } = await supabase
      .from('user_types')
      .upsert(userTypes, { onConflict: 'slug' });

    if (error) {
      console.error('  User types error:', error.message);
    } else {
      console.log(`  ✓ ${userTypes.length} user types migrated`);
    }
  }

  // 4. 목적별 추천 마이그레이션
  const purposeRecs = (seedData as Record<string, unknown>).purpose_tool_recommendations as Array<Record<string, unknown>> | undefined;
  if (purposeRecs?.length) {
    console.log('\n4. Migrating purpose recommendations...');
    const { error } = await supabase
      .from('purpose_tool_recommendations')
      .upsert(purposeRecs, { onConflict: 'id' });

    if (error) {
      console.error('  Purpose recs error:', error.message);
    } else {
      console.log(`  ✓ ${purposeRecs.length} purpose recommendations migrated`);
    }
  }

  // 5. 뉴스 마이그레이션
  const news = (seedData as Record<string, unknown>).news as Array<Record<string, unknown>> | undefined;
  if (news?.length) {
    console.log('\n5. Migrating news...');
    const { error } = await supabase
      .from('news')
      .upsert(news, { onConflict: 'id' });

    if (error) {
      console.error('  News error:', error.message);
    } else {
      console.log(`  ✓ ${news.length} news articles migrated`);
    }
  }

  // 6. 가이드 마이그레이션
  const guides = (seedData as Record<string, unknown>).guides as Array<Record<string, unknown>> | undefined;
  if (guides?.length) {
    console.log('\n6. Migrating guides...');
    const { error } = await supabase
      .from('guides')
      .upsert(guides, { onConflict: 'slug' });

    if (error) {
      console.error('  Guides error:', error.message);
    } else {
      console.log(`  ✓ ${guides.length} guides migrated`);
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log('이후 도구 추가는 discovery pipeline에서 자동으로 처리됩니다.');
}

main().catch(console.error);
