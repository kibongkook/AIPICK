import type { SupabaseClient } from '@supabase/supabase-js';

interface ToolIdentifier {
  id: string;
  name: string;
  slug: string;
  model_identifiers: string[];
  url: string;
}

/**
 * 외부 모델명으로 DB 도구를 매칭합니다.
 *
 * 매칭 우선순위:
 * 1. model_identifiers 배열에 정확히 포함된 경우
 * 2. 도구 이름의 소문자 일치
 * 3. 도구 slug의 일치
 */
export async function findToolByModelName(
  supabase: SupabaseClient,
  modelName: string,
  cachedTools?: ToolIdentifier[]
): Promise<ToolIdentifier | null> {
  const tools = cachedTools ?? await loadToolIdentifiers(supabase);
  const lowerModel = modelName.toLowerCase();

  // 1. model_identifiers 배열에서 매칭
  for (const tool of tools) {
    if (tool.model_identifiers.some((id) => lowerModel.includes(id.toLowerCase()))) {
      return tool;
    }
  }

  // 2. 도구 이름 매칭
  for (const tool of tools) {
    if (lowerModel.includes(tool.name.toLowerCase())) {
      return tool;
    }
  }

  // 3. slug 매칭
  for (const tool of tools) {
    if (lowerModel.includes(tool.slug)) {
      return tool;
    }
  }

  return null;
}

/**
 * DB에서 도구 식별 정보를 로드합니다.
 */
export async function loadToolIdentifiers(
  supabase: SupabaseClient
): Promise<ToolIdentifier[]> {
  const { data } = await supabase
    .from('tools')
    .select('id, name, slug, model_identifiers, url');

  return (data ?? []) as ToolIdentifier[];
}

/**
 * GitHub URL에서 owner/repo를 추출합니다.
 */
export function extractGitHubRepo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}
