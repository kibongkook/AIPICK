import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  MAX_MEDIA_FILE_SIZE_MB,
  MAX_VIDEO_FILE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from '@/lib/constants';

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

/** POST /api/community/media - 미디어 파일 업로드 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'file required' }, { status: 400 });
  }

  // 타입 검증
  if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
    return NextResponse.json(
      { error: `허용되지 않는 파일 형식입니다. (${ALLOWED_TYPES.join(', ')})` },
      { status: 400 }
    );
  }

  // 크기 검증
  const isVideo = file.type.startsWith('video/');
  const maxSizeMB = isVideo ? MAX_VIDEO_FILE_SIZE_MB : MAX_MEDIA_FILE_SIZE_MB;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return NextResponse.json(
      { error: `파일 크기가 ${maxSizeMB}MB를 초과합니다` },
      { status: 400 }
    );
  }

  // Supabase Storage 업로드
  const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('community-media')
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('community-media')
    .getPublicUrl(path);

  return NextResponse.json({
    media: {
      url: publicUrl,
      type: isVideo ? 'video' : 'image',
      size: file.size,
      filename: file.name,
    },
  });
}
