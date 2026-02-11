import type { AIRecipe } from '@/types';

/**
 * AI 레시피 시드 데이터
 * tool_slug는 AIPICK에 등록된 도구의 slug와 매칭됨
 */
export const AI_RECIPES: AIRecipe[] = [
  // ==========================================
  // 1. 음악 제작: AI로 나만의 노래 만들기
  // ==========================================
  {
    slug: 'ai-song-creation',
    title: 'AI로 나만의 노래 만들기',
    subtitle: '가사 작성부터 음악 생성, 마스터링까지 — 악기 못 다뤄도 OK',
    category: 'music',
    difficulty: 'medium',
    estimated_time: '30분~1시간',
    tool_count: 3,
    icon: 'Music',
    color: 'from-pink-500 to-rose-600',
    result_description: '가사, 멜로디, 보컬이 포함된 완성된 노래 MP3 파일',
    tags: ['음악', '노래', '가사', '작곡', 'Suno'],
    steps: [
      {
        step: 1,
        title: '가사 & 곡 컨셉 작성',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        alt_tools: ['claude', 'gemini'],
        action: '장르, 분위기, 주제를 정하고 가사를 생성합니다. 절/후렴/브릿지 구조로 작성하세요.',
        prompt_example: '"감성적인 인디 팝 노래 가사를 써줘. 주제는 \'졸업 후 각자의 길을 가는 친구들\'. 1절-후렴-2절-후렴-브릿지-후렴 구조로, 한국어로 작성해줘. 각 부분을 [Verse 1], [Chorus] 등으로 구분해줘."',
        tip: 'Suno에서 [Verse], [Chorus], [Bridge] 태그를 인식하므로 구조 태그를 반드시 넣으세요.',
      },
      {
        step: 2,
        title: '스타일 프롬프트 작성',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        action: 'Suno에 넣을 스타일 설명을 영어로 작성합니다. 아티스트명 대신 사운드를 묘사합니다.',
        prompt_example: '"이 가사에 어울리는 Suno AI 스타일 프롬프트를 영어로 써줘. 아티스트 이름은 쓰지 말고, 사운드 특징으로 묘사해줘. 예: dreamy indie pop, soft acoustic guitar, warm female vocals, gentle drum, 120bpm"',
        tip: 'Suno는 아티스트명을 차단하므로 "BTS 스타일" 대신 "energetic K-pop, powerful male vocal group, synchronized dance beat"처럼 묘사합니다.',
      },
      {
        step: 3,
        title: '음악 생성',
        tool_slug: 'suno-ai',
        tool_name: 'Suno',
        alt_tools: ['udio'],
        action: 'Custom Mode에서 가사를 붙여넣고, 스타일 프롬프트를 입력한 뒤 생성합니다. 3~5개 변형을 만들고 최적을 선택하세요.',
        tip: '마음에 드는 부분이 있으면 Extend로 연장하고, 약한 부분만 재생성할 수 있습니다. 무료 크레딧으로 하루 5곡 정도 가능합니다.',
      },
    ],
  },

  // ==========================================
  // 2. 영상 제작: 숏필름 만들기
  // ==========================================
  {
    slug: 'ai-short-film',
    title: 'AI 숏필름 만들기',
    subtitle: '카메라 없이 각본부터 영상까지 — AI로 3~5분 영화 제작',
    category: 'video',
    difficulty: 'hard',
    estimated_time: '2~4시간',
    tool_count: 5,
    icon: 'Video',
    color: 'from-red-500 to-orange-600',
    result_description: '음성, 배경음악이 포함된 3~5분 분량의 시네마틱 영상',
    tags: ['영상', '숏필름', '영화', 'Midjourney', 'Runway'],
    steps: [
      {
        step: 1,
        title: '각본 & 스토리보드 작성',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        alt_tools: ['claude'],
        action: '장면별 설명, 대사, 카메라 앵글을 포함한 각본을 작성합니다.',
        prompt_example: '"3분 분량의 SF 단편영화 각본을 써줘. 주제: 2050년 서울에서 AI와 공존하는 일상. 5개 장면으로 구성하고, 각 장면마다 [시각 묘사], [대사], [카메라 앵글], [분위기]를 포함해줘."',
      },
      {
        step: 2,
        title: '장면 키프레임 생성',
        tool_slug: 'midjourney',
        tool_name: 'Midjourney',
        alt_tools: ['leonardo-ai', 'dall-e-3'],
        action: '각 장면의 핵심 이미지를 생성합니다. 일관된 스타일을 위해 --sref(스타일 레퍼런스)를 활용하세요.',
        prompt_example: '"Cinematic still from a sci-fi film, a young Korean woman walking through neon-lit streets of Seoul 2050, holographic advertisements, rain-soaked pavement, anamorphic lens flare, 16:9 --ar 16:9 --style raw --v 7"',
        tip: '첫 번째 이미지의 스타일이 마음에 들면 --sref [이미지URL]로 나머지 장면에 동일한 스타일을 적용하세요.',
      },
      {
        step: 3,
        title: '이미지 → 영상 변환',
        tool_slug: 'runway-ml',
        tool_name: 'Runway Gen-4',
        alt_tools: ['kling-ai', 'pika'],
        action: 'Midjourney 키프레임을 업로드하고 움직임을 추가합니다. Image-to-Video 모드를 사용합니다.',
        tip: '5~10초 클립으로 나눠서 생성한 뒤 편집 소프트웨어에서 이어 붙이는 것이 품질이 더 좋습니다.',
      },
      {
        step: 4,
        title: '나레이션 & 음성 생성',
        tool_slug: 'elevenlabs',
        tool_name: 'ElevenLabs',
        alt_tools: ['typecast'],
        action: '대사나 나레이션을 자연스러운 AI 음성으로 생성합니다. 한국어도 지원됩니다.',
        prompt_example: '텍스트 입력 후 "Rachel" 또는 한국어 음성 모델 선택. Stability: 0.5, Similarity: 0.75 권장.',
        tip: '무료 플랜으로 매월 10,000자까지 사용 가능합니다.',
      },
      {
        step: 5,
        title: '편집 & 조립',
        tool_slug: 'capcut',
        tool_name: 'CapCut',
        alt_tools: ['vrew'],
        action: '모든 클립을 타임라인에 배치하고, 음성/음악을 동기화하고, 트랜지션과 자막을 추가합니다.',
        tip: 'CapCut의 자동 자막 기능으로 한국어 자막을 빠르게 추가할 수 있습니다.',
      },
    ],
  },

  // ==========================================
  // 3. 캐릭터 일관성 유지 이미지
  // ==========================================
  {
    slug: 'consistent-character-images',
    title: '캐릭터 일관성 유지 이미지 만들기',
    subtitle: '동화책, 만화, 마케팅에 쓸 동일 캐릭터의 다양한 장면 생성',
    category: 'image',
    difficulty: 'medium',
    estimated_time: '1~2시간',
    tool_count: 3,
    icon: 'Image',
    color: 'from-purple-500 to-pink-600',
    result_description: '동일 캐릭터가 다양한 장면/포즈로 등장하는 일관된 이미지 세트',
    tags: ['캐릭터', '동화책', '일관성', '이미지', 'Midjourney'],
    steps: [
      {
        step: 1,
        title: '캐릭터 설정 문서 작성',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        alt_tools: ['claude'],
        action: '캐릭터의 외형, 의상, 특징을 상세하게 정의합니다.',
        prompt_example: '"동화책 주인공 캐릭터를 만들어줘. 이름: 하늘이, 나이: 8세 여자아이, 외형: 단발머리(갈색), 큰 동그란 눈, 항상 파란색 멜빵 원피스와 빨간 운동화. 성격: 호기심 많고 씩씩함. 이 설명을 영어 Midjourney 프롬프트로 변환해줘."',
      },
      {
        step: 2,
        title: '기준 이미지(레퍼런스) 생성',
        tool_slug: 'midjourney',
        tool_name: 'Midjourney',
        alt_tools: ['leonardo-ai'],
        action: '정면 전신 레퍼런스를 생성합니다. v7의 Omni-Reference 기능으로 이후 일관성을 유지합니다.',
        prompt_example: '"A cheerful 8-year-old Korean girl with short brown bob hair, big round eyes, wearing a blue overall dress and red sneakers, full body front view, simple white background, children book illustration style --ar 3:4 --v 7"',
        tip: '마음에 드는 이미지가 나오면 업스케일 후 다운로드해 놓으세요. 이 이미지가 모든 장면의 기준이 됩니다.',
      },
      {
        step: 3,
        title: '다양한 장면에서 캐릭터 생성',
        tool_slug: 'leonardo-ai',
        tool_name: 'Leonardo AI',
        alt_tools: ['midjourney'],
        action: 'Character Reference 기능으로 기준 이미지를 업로드하고, 다양한 배경/포즈에서 동일 캐릭터를 생성합니다.',
        prompt_example: '기준 이미지 업로드 → Character Reference 강도 "High" → "same girl playing in a sunny park with butterflies, children book illustration"',
        tip: 'Leonardo AI의 Character Reference 강도를 High로 설정하면 얼굴, 체형, 의상까지 일관되게 유지됩니다.',
      },
    ],
  },

  // ==========================================
  // 4. PPT/발표자료 만들기
  // ==========================================
  {
    slug: 'ai-presentation',
    title: 'AI로 발표자료 만들기',
    subtitle: '아웃라인만 잡으면 디자인까지 자동 — 5분 만에 완성',
    category: 'presentation',
    difficulty: 'easy',
    estimated_time: '15~30분',
    tool_count: 3,
    icon: 'Presentation',
    color: 'from-blue-500 to-indigo-600',
    result_description: '15~20장의 프로페셔널한 슬라이드 + 발표 노트',
    tags: ['PPT', '발표', '슬라이드', 'Gamma', '프레젠테이션'],
    steps: [
      {
        step: 1,
        title: '주제 리서치 & 아웃라인',
        tool_slug: 'perplexity',
        tool_name: 'Perplexity',
        alt_tools: ['chatgpt', 'you-com'],
        action: '주제에 대한 최신 데이터와 인사이트를 수집하고, 슬라이드 아웃라인을 작성합니다.',
        prompt_example: '"AI가 교육에 미치는 영향에 대해 발표해야 해. 최신 통계와 사례를 포함한 15장짜리 PPT 아웃라인을 만들어줘. 각 슬라이드 제목과 핵심 포인트 3개씩."',
      },
      {
        step: 2,
        title: '슬라이드 자동 생성',
        tool_slug: 'gamma',
        tool_name: 'Gamma',
        alt_tools: ['beautiful-ai', 'slidesai'],
        action: '아웃라인을 Gamma에 붙여넣으면 AI가 디자인, 레이아웃, 이미지까지 자동으로 완성합니다.',
        tip: 'Gamma에서 "Paste in outline" 옵션으로 아웃라인을 입력하면 가장 정확한 결과가 나옵니다. 생성 후 테마를 한 번에 변경 가능합니다.',
      },
      {
        step: 3,
        title: '커스텀 이미지 보강',
        tool_slug: 'dall-e-3',
        tool_name: 'DALL·E 3',
        alt_tools: ['midjourney', 'ideogram'],
        action: '핵심 슬라이드에 들어갈 맞춤 일러스트나 인포그래픽을 생성하여 Gamma 슬라이드에 교체합니다.',
        prompt_example: '"A clean, modern infographic showing AI adoption rates in education across different countries, flat design, blue and white color scheme, no text"',
      },
    ],
  },

  // ==========================================
  // 5. SEO 블로그 글쓰기
  // ==========================================
  {
    slug: 'seo-blog-writing',
    title: 'SEO 최적화 블로그 글쓰기',
    subtitle: '키워드 리서치부터 교정까지 — 검색 상위 노출되는 글',
    category: 'blog',
    difficulty: 'medium',
    estimated_time: '1~2시간',
    tool_count: 4,
    icon: 'PenTool',
    color: 'from-emerald-500 to-teal-600',
    result_description: '2,000~3,000자의 SEO 최적화 블로그 포스트 + 대표 이미지',
    tags: ['블로그', 'SEO', '글쓰기', '콘텐츠', '마케팅'],
    steps: [
      {
        step: 1,
        title: '키워드 & 경쟁 분석',
        tool_slug: 'perplexity',
        tool_name: 'Perplexity',
        alt_tools: ['chatgpt'],
        action: '타겟 키워드의 검색 의도를 파악하고, 상위 5개 경쟁 글의 구조를 분석합니다.',
        prompt_example: '"\'AI 글쓰기 도구 추천\' 키워드로 블로그를 쓰려고 해. 이 키워드의 검색 의도와 관련 롱테일 키워드 10개를 정리해줘. 그리고 상위 5개 글의 공통 구조(H2 헤딩)도 분석해줘."',
      },
      {
        step: 2,
        title: '아웃라인 & 초안 작성',
        tool_slug: 'claude',
        tool_name: 'Claude',
        alt_tools: ['chatgpt', 'jasper'],
        action: '키워드 분석 결과를 바탕으로 H2/H3 구조의 아웃라인을 잡고 전체 초안을 작성합니다.',
        prompt_example: '"다음 키워드와 아웃라인으로 블로그 글을 작성해줘: [키워드 목록]. 톤: 친근하지만 전문적, 길이: 2500자, 한국어 경어체, SEO 제목과 메타 설명도 포함."',
        tip: 'Claude는 긴 글의 일관성 유지에 강합니다. "한 번에 전체 초안"을 요청하세요.',
      },
      {
        step: 3,
        title: '교정 & 문체 다듬기',
        tool_slug: 'grammarly',
        tool_name: 'Grammarly',
        alt_tools: ['quillbot', 'wordtune'],
        action: '문법 오류, 가독성, 톤을 검사하고 다듬습니다. 영어 콘텐츠의 경우 특히 유용합니다.',
        tip: '한국어 글의 경우 ChatGPT에게 "이 글의 맞춤법, 비문, 어색한 표현을 교정해줘"라고 요청하는 것이 더 효과적입니다.',
      },
      {
        step: 4,
        title: '대표 이미지 생성',
        tool_slug: 'canva-ai',
        tool_name: 'Canva AI',
        alt_tools: ['dall-e-3', 'midjourney'],
        action: '블로그 대표 이미지와 본문 삽입용 그래픽을 생성합니다.',
        prompt_example: 'Canva의 Magic Media 기능 → "Modern flat illustration of a person using AI writing tools on a laptop, minimalist style, blue and purple tones"',
      },
    ],
  },

  // ==========================================
  // 6. 숏폼 영상 콘텐츠
  // ==========================================
  {
    slug: 'short-form-video',
    title: '숏폼 영상 대량 생산 (릴스/쇼츠/틱톡)',
    subtitle: '하루 3개씩 — 스크립트부터 편집, 자막까지 자동화',
    category: 'social',
    difficulty: 'medium',
    estimated_time: '30분~1시간 (영상 1개당)',
    tool_count: 4,
    icon: 'Smartphone',
    color: 'from-violet-500 to-purple-600',
    result_description: '15~60초 세로 숏폼 영상 + 자막 + 썸네일',
    tags: ['숏폼', '틱톡', '릴스', '쇼츠', 'SNS', 'CapCut'],
    steps: [
      {
        step: 1,
        title: '트렌드 리서치 & 스크립트',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        alt_tools: ['claude', 'perplexity'],
        action: '플랫폼 트렌드를 분석하고, 처음 3초 훅이 포함된 숏폼 스크립트를 작성합니다.',
        prompt_example: '"틱톡에서 인기 있는 AI 활용 팁 콘텐츠를 만들려고 해. 45초 분량 스크립트를 써줘. 첫 3초에 강력한 훅 넣어줘. 포맷: [시간] 대사/액션 형태로."',
        tip: '처음 3초 훅이 시청 지속률의 80%를 결정합니다. "이거 모르면 손해", "1분만 투자하면" 같은 직관적 훅을 쓰세요.',
      },
      {
        step: 2,
        title: 'AI 아바타 또는 영상 생성',
        tool_slug: 'heygen',
        tool_name: 'HeyGen',
        alt_tools: ['synthesia', 'd-id'],
        action: '스크립트를 붙여넣으면 AI 아바타가 말하는 영상을 자동 생성합니다. 얼굴 공개 없이 영상 제작 가능.',
        tip: 'HeyGen 무료 플랜으로 1분 영상 1개/월 가능. 얼굴을 보여주고 싶지 않다면 AI 아바타가 최적입니다.',
      },
      {
        step: 3,
        title: '편집 & 자막 추가',
        tool_slug: 'capcut',
        tool_name: 'CapCut',
        alt_tools: ['vrew'],
        action: '9:16 비율로 편집하고, 자동 자막, 트렌딩 효과, 배경음악을 추가합니다.',
        tip: 'CapCut의 "자동 캡션" 기능으로 한국어 자막을 한 번에 생성하세요. 자막 스타일은 큰 글씨 + 색상 강조가 시청률을 높입니다.',
      },
      {
        step: 4,
        title: '썸네일 & 캡션 생성',
        tool_slug: 'canva-ai',
        tool_name: 'Canva AI',
        alt_tools: ['dall-e-3'],
        action: '표정이 살아있는 썸네일을 만들고, 플랫폼별 캡션과 해시태그를 생성합니다.',
        prompt_example: 'ChatGPT에게: "이 숏폼 영상의 틱톡용 캡션 3개를 써줘. 해시태그 10개도 추천해줘. 톤: 10대~20대 타겟, 호기심 유발"',
      },
    ],
  },

  // ==========================================
  // 7. 이커머스 상품 사진
  // ==========================================
  {
    slug: 'ecommerce-product-photo',
    title: '상품 사진 프로 품질로 만들기',
    subtitle: '스마트폰 촬영 한 장으로 스튜디오급 상품 이미지 완성',
    category: 'ecommerce',
    difficulty: 'easy',
    estimated_time: '15~30분',
    tool_count: 3,
    icon: 'ShoppingBag',
    color: 'from-amber-500 to-yellow-600',
    result_description: '배경 제거 + 라이프스타일 배치된 프로페셔널 상품 이미지 5~10장',
    tags: ['이커머스', '상품사진', '쇼핑몰', '스마트스토어', '배경제거'],
    steps: [
      {
        step: 1,
        title: '배경 제거 & 보정',
        tool_slug: 'photoroom',
        tool_name: 'Photoroom',
        alt_tools: ['remove-bg', 'clipdrop'],
        action: '스마트폰으로 찍은 상품 사진의 배경을 AI로 즉시 제거하고, 조명과 색감을 보정합니다.',
        tip: '흰 배경이나 단색 배경에서 찍으면 AI 배경 제거 정확도가 훨씬 올라갑니다.',
      },
      {
        step: 2,
        title: '라이프스타일 배경 생성',
        tool_slug: 'dall-e-3',
        tool_name: 'DALL·E 3',
        alt_tools: ['midjourney', 'stable-diffusion'],
        action: '상품에 어울리는 라이프스타일 배경을 AI로 생성하여 합성합니다.',
        prompt_example: '"A cozy minimalist living room with warm lighting, wooden coffee table in the center, soft beige sofa in background, product placement area in the center of the table, photorealistic, 4K"',
        tip: 'Photoroom의 "AI Backgrounds" 기능을 쓰면 배경 제거 → 배경 생성을 원스톱으로 처리할 수 있습니다.',
      },
      {
        step: 3,
        title: '상품 설명 글 작성',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        alt_tools: ['claude', 'wrtn'],
        action: '상품 특징을 입력하면 스마트스토어/쿠팡에 최적화된 상품 설명을 자동 생성합니다.',
        prompt_example: '"다음 상품의 스마트스토어 상세 설명을 써줘: [상품명, 재질, 사이즈, 특징]. 구매 포인트 5가지, 사용 후기 느낌의 문장 3개, SEO 키워드 포함."',
      },
    ],
  },

  // ==========================================
  // 8. AI 뮤직비디오
  // ==========================================
  {
    slug: 'ai-music-video',
    title: 'AI 뮤직비디오 만들기',
    subtitle: '내가 만든 AI 노래에 영상까지 — 완전한 뮤직비디오 제작',
    category: 'video',
    difficulty: 'hard',
    estimated_time: '3~5시간',
    tool_count: 5,
    icon: 'Film',
    color: 'from-rose-500 to-red-600',
    result_description: '원곡 + 영상 + 립싱크가 결합된 3~4분 뮤직비디오',
    tags: ['뮤직비디오', '음악', '영상', 'Suno', 'Runway', '립싱크'],
    steps: [
      {
        step: 1,
        title: '곡 제작',
        tool_slug: 'suno-ai',
        tool_name: 'Suno',
        alt_tools: ['udio'],
        action: '"AI로 나만의 노래 만들기" 레시피를 참고하여 곡을 먼저 완성합니다.',
        tip: '뮤직비디오를 만들 곡은 가사가 명확하고 장면 전환이 가능한 서사가 있는 곡이 좋습니다.',
      },
      {
        step: 2,
        title: '아티스트 & 장면 디자인',
        tool_slug: 'midjourney',
        tool_name: 'Midjourney',
        alt_tools: ['leonardo-ai', 'flux'],
        action: '가상 아티스트의 외형을 디자인하고, 가사의 각 구간에 맞는 장면 키프레임을 생성합니다.',
        prompt_example: '"K-pop idol, young Korean woman with platinum blonde hair, dramatic stage lighting, wearing a futuristic silver outfit, close-up portrait, photorealistic --ar 16:9 --v 7"',
      },
      {
        step: 3,
        title: '장면 영상화',
        tool_slug: 'runway-ml',
        tool_name: 'Runway',
        alt_tools: ['kling-ai', 'pika'],
        action: '키프레임 이미지를 5~10초 영상 클립으로 변환합니다.',
        tip: '한 장면당 여러 번 생성하여 가장 자연스러운 움직임을 선택하세요.',
      },
      {
        step: 4,
        title: '립싱크 적용',
        tool_slug: 'kling-ai',
        tool_name: 'Kling AI',
        alt_tools: ['heygen'],
        action: '가사 구간의 클로즈업 장면에 립싱크를 적용하여 캐릭터가 실제로 노래하는 것처럼 만듭니다.',
      },
      {
        step: 5,
        title: '최종 편집',
        tool_slug: 'capcut',
        tool_name: 'CapCut',
        alt_tools: ['vrew'],
        action: '음원과 영상 클립을 동기화하고, 트랜지션, 가사 자막, 비주얼 이펙트를 추가합니다.',
        tip: 'CapCut에서 음원의 비트에 맞춰 자동 커팅 기능을 활용하면 리듬감 있는 편집이 가능합니다.',
      },
    ],
  },

  // ==========================================
  // 9. 팟캐스트 제작
  // ==========================================
  {
    slug: 'ai-podcast',
    title: 'AI 팟캐스트 제작하기',
    subtitle: '자료만 넣으면 두 진행자가 대화하는 팟캐스트 자동 생성',
    category: 'podcast',
    difficulty: 'medium',
    estimated_time: '1~2시간',
    tool_count: 4,
    icon: 'Mic',
    color: 'from-indigo-500 to-purple-600',
    result_description: '10~20분 분량의 두 진행자 대화형 팟캐스트 에피소드',
    tags: ['팟캐스트', '오디오', '음성', 'NotebookLM', 'ElevenLabs'],
    steps: [
      {
        step: 1,
        title: '주제 리서치 & 자료 준비',
        tool_slug: 'perplexity',
        tool_name: 'Perplexity',
        alt_tools: ['chatgpt'],
        action: '팟캐스트 주제에 대한 자료를 수집하고 요약합니다. PDF, 웹페이지, 논문 등을 모읍니다.',
      },
      {
        step: 2,
        title: 'AI 대화 생성',
        tool_slug: 'google-notebooklm',
        tool_name: 'NotebookLM',
        action: '수집한 자료를 NotebookLM에 업로드하면, AI가 두 진행자의 자연스러운 대화형 팟캐스트를 자동 생성합니다.',
        tip: 'NotebookLM의 "Audio Overview" 기능을 사용합니다. 자료를 많이 넣을수록 대화가 풍부해집니다.',
      },
      {
        step: 3,
        title: '음성 커스텀 (선택)',
        tool_slug: 'elevenlabs',
        tool_name: 'ElevenLabs',
        alt_tools: ['typecast'],
        action: 'NotebookLM의 기본 음성이 맘에 들지 않으면, 텍스트를 추출하여 원하는 목소리로 재생성합니다.',
        tip: '본인 목소리로 팟캐스트를 만들고 싶다면, ElevenLabs Voice Clone으로 30분 분량의 녹음을 학습시킬 수 있습니다.',
      },
      {
        step: 4,
        title: '편집 & 쇼노트 작성',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        alt_tools: ['claude'],
        action: '오디오 편집 후, 에피소드 제목, 요약, 타임스탬프, 관련 링크가 포함된 쇼노트를 작성합니다.',
        prompt_example: '"다음 팟캐스트 스크립트를 바탕으로 쇼노트를 작성해줘: 에피소드 제목(흥미로운), 3줄 요약, 타임스탬프(주요 구간), 핵심 키워드 5개."',
      },
    ],
  },

  // ==========================================
  // 10. 마케팅 캠페인 전체
  // ==========================================
  {
    slug: 'full-marketing-campaign',
    title: '마케팅 캠페인 한 번에 만들기',
    subtitle: 'SNS 광고, 이메일, 랜딩페이지 카피까지 — 올인원 캠페인',
    category: 'marketing',
    difficulty: 'medium',
    estimated_time: '2~3시간',
    tool_count: 5,
    icon: 'Megaphone',
    color: 'from-orange-500 to-red-600',
    result_description: '광고 카피 + 비주얼 + 이메일 시퀀스 + SNS 포스트 세트',
    tags: ['마케팅', '광고', '카피라이팅', 'SNS', '이메일'],
    steps: [
      {
        step: 1,
        title: '시장 분석 & 타겟 정의',
        tool_slug: 'perplexity',
        tool_name: 'Perplexity',
        alt_tools: ['chatgpt'],
        action: '경쟁사 분석, 타겟 페르소나, 핵심 메시지를 정의합니다.',
        prompt_example: '"우리 제품: [설명]. 타겟: [대상]. 경쟁사 3곳의 마케팅 전략을 분석하고, 차별화 포인트 3가지를 뽑아줘."',
      },
      {
        step: 2,
        title: '카피 & 메시지 생성',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        alt_tools: ['claude', 'jasper', 'copy-ai'],
        action: '플랫폼별 광고 카피(인스타, 페이스북, 구글), 이메일 시퀀스, 랜딩페이지 카피를 한 번에 생성합니다.',
        prompt_example: '"다음 제품의 마케팅 카피를 만들어줘: [제품설명]. 필요한 것: 1) 인스타 광고 카피 3개 2) 이메일 제목 5개 3) 랜딩페이지 히어로 문구 3개 4) CTA 버튼 텍스트 5개. 톤: 신뢰감 + 긴급성."',
      },
      {
        step: 3,
        title: '광고 비주얼 제작',
        tool_slug: 'canva-ai',
        tool_name: 'Canva AI',
        alt_tools: ['midjourney', 'dall-e-3'],
        action: '인스타 피드/스토리/릴스 커버 등 플랫폼별 사이즈에 맞는 광고 이미지를 생성합니다.',
        tip: 'Canva의 Magic Resize로 하나의 디자인을 모든 플랫폼 사이즈로 한 번에 변환할 수 있습니다.',
      },
      {
        step: 4,
        title: '짧은 영상 광고 제작',
        tool_slug: 'invideo-ai',
        tool_name: 'InVideo AI',
        alt_tools: ['fliki', 'capcut'],
        action: '텍스트 프롬프트를 입력하면 광고 영상을 자동으로 만들어줍니다. 스톡 영상 + 자막 + 음악 포함.',
        prompt_example: '"Create a 30-second Instagram ad video for [product]. Tone: modern, trust-building. Include: product benefits, customer testimonial feel, strong CTA at the end."',
      },
      {
        step: 5,
        title: '자동화 & 스케줄링',
        tool_slug: 'zapier-ai',
        tool_name: 'Zapier',
        alt_tools: ['make'],
        action: '만들어진 콘텐츠를 자동으로 SNS에 예약 포스팅하고, 이메일을 자동 발송하는 워크플로우를 설정합니다.',
        tip: 'Zapier의 "AI by Zapier" 스텝을 사용하면 워크플로우 중간에 GPT를 호출하여 콘텐츠를 동적으로 변형할 수 있습니다.',
      },
    ],
  },

  // ==========================================
  // 11. 온라인 강의 제작
  // ==========================================
  {
    slug: 'online-course-creation',
    title: 'AI로 온라인 강의 만들기',
    subtitle: '커리큘럼 설계부터 영상 강의까지 — 강사 얼굴 없이도 OK',
    category: 'education',
    difficulty: 'hard',
    estimated_time: '1~2일 (10강 기준)',
    tool_count: 5,
    icon: 'GraduationCap',
    color: 'from-cyan-500 to-blue-600',
    result_description: '10개 강의 영상 + 퀴즈 + 강의 자료가 포함된 온라인 코스',
    tags: ['강의', '교육', '온라인코스', '이러닝', 'HeyGen'],
    steps: [
      {
        step: 1,
        title: '커리큘럼 & 강의 스크립트',
        tool_slug: 'claude',
        tool_name: 'Claude',
        alt_tools: ['chatgpt'],
        action: '강좌 목표를 입력하면 모듈별 커리큘럼과 각 강의의 상세 스크립트를 작성합니다.',
        prompt_example: '"Python 입문 온라인 강좌를 만들려고 해. 완전 초보 대상, 10강 구성. 각 강의마다: 학습목표 3개, 15분 분량 강의 스크립트, 퀴즈 3문제를 만들어줘."',
        tip: 'Claude는 긴 컨텍스트 처리에 강해서, 전체 10강을 한 대화에서 일관되게 작성할 수 있습니다.',
      },
      {
        step: 2,
        title: 'AI 강사 영상 생성',
        tool_slug: 'heygen',
        tool_name: 'HeyGen',
        alt_tools: ['synthesia', 'd-id'],
        action: '스크립트를 넣으면 AI 아바타가 말하는 강의 영상을 생성합니다. 한국어 지원.',
      },
      {
        step: 3,
        title: '강의 자료 (슬라이드) 제작',
        tool_slug: 'gamma',
        tool_name: 'Gamma',
        alt_tools: ['beautiful-ai', 'canva-ai'],
        action: '각 강의의 핵심 내용을 슬라이드로 만들어 강의 영상에 삽입하거나 별도 자료로 제공합니다.',
      },
      {
        step: 4,
        title: '음성 다국어 변환 (선택)',
        tool_slug: 'elevenlabs',
        tool_name: 'ElevenLabs',
        alt_tools: ['typecast'],
        action: '한국어 강의를 영어, 일본어 등으로 AI 더빙하여 글로벌 수강생 확보가 가능합니다.',
      },
      {
        step: 5,
        title: '영상 편집 & 조립',
        tool_slug: 'capcut',
        tool_name: 'CapCut',
        alt_tools: ['vrew', 'descript'],
        action: 'AI 강사 영상 + 슬라이드 + 화면 녹화를 편집하고, 챕터 마커와 자막을 추가합니다.',
      },
    ],
  },

  // ==========================================
  // 12. 로고 & 브랜드 아이덴티티
  // ==========================================
  {
    slug: 'brand-identity-creation',
    title: '로고 & 브랜드 아이덴티티 만들기',
    subtitle: '디자이너 없이 전문적인 브랜드 비주얼 완성',
    category: 'brand',
    difficulty: 'medium',
    estimated_time: '1~2시간',
    tool_count: 4,
    icon: 'Palette',
    color: 'from-pink-500 to-violet-600',
    result_description: '로고 + 컬러 팔레트 + 명함/SNS 프로필 템플릿',
    tags: ['로고', '브랜드', '디자인', '아이덴티티', 'Midjourney'],
    steps: [
      {
        step: 1,
        title: '브랜드 전략 & 컨셉',
        tool_slug: 'chatgpt',
        tool_name: 'ChatGPT',
        alt_tools: ['claude'],
        action: '브랜드 성격, 타겟 고객, 경쟁 차별점을 정리하고, 비주얼 방향성을 정합니다.',
        prompt_example: '"카페 브랜드를 만들거야. 이름: \'숲속 커피\'. 컨셉: 자연친화적, 따뜻한, 미니멀. 로고 디자인 방향 3가지를 제안해줘. 각각의 시각적 키워드와 Midjourney 프롬프트도 만들어줘."',
      },
      {
        step: 2,
        title: '로고 아이콘 생성',
        tool_slug: 'midjourney',
        tool_name: 'Midjourney',
        alt_tools: ['leonardo-ai', 'dall-e-3'],
        action: '다양한 로고 컨셉을 생성합니다. 심볼/아이콘 형태가 가장 잘 나옵니다.',
        prompt_example: '"Minimalist logo icon for a coffee shop called Forest Coffee, a single tree with coffee cup silhouette, clean lines, flat design, single color on white background --no text --v 7"',
        tip: 'Midjourney는 텍스트 렌더링이 부정확합니다. 아이콘/심볼만 생성하고, 텍스트는 다음 단계에서 추가하세요.',
      },
      {
        step: 3,
        title: '텍스트 로고 생성',
        tool_slug: 'ideogram',
        tool_name: 'Ideogram',
        action: '브랜드명 텍스트가 포함된 로고를 생성합니다. Ideogram은 텍스트 정확도가 매우 높습니다.',
        prompt_example: '"Logo design for \'숲속 커피\' (Forest Coffee), elegant serif font combined with minimalist tree icon, green and brown earth tones, clean white background"',
        tip: '"Ideogram은 서체 전문가, Midjourney는 아이콘 아티스트." 둘의 결과를 조합하면 완성도가 크게 올라갑니다.',
      },
      {
        step: 4,
        title: '브랜드 키트 완성',
        tool_slug: 'canva-ai',
        tool_name: 'Canva AI',
        action: '로고를 업로드하고 Canva의 Brand Kit으로 컬러 팔레트, 명함, SNS 프로필 이미지, 메뉴판 등을 한 번에 생성합니다.',
        tip: 'Canva의 "Brand Kit" 기능에 로고와 색상을 등록하면, 모든 템플릿에 자동 적용됩니다.',
      },
    ],
  },
];

/**
 * slug로 레시피 찾기
 */
export function getRecipeBySlug(slug: string): AIRecipe | undefined {
  return AI_RECIPES.find(r => r.slug === slug);
}

/**
 * 카테고리별 레시피 필터
 */
export function getRecipesByCategory(category: string): AIRecipe[] {
  if (category === 'all') return AI_RECIPES;
  return AI_RECIPES.filter(r => r.category === category);
}
