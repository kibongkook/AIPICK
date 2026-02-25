/**
 * 태그 자동 추출을 위한 매칭 사전
 */

// ==========================================
// 영어→한글 단어 매핑 (전처리용)
// ==========================================
export const EN_KO_WORD_MAP: Record<string, string> = {
  // 기능 관련
  'video': '영상', 'image': '이미지', 'photo': '사진', 'picture': '그림',
  'audio': '오디오', 'music': '음악', 'sound': '소리', 'voice': '음성',
  'text': '텍스트', 'code': '코드', 'coding': '코딩', 'programming': '프로그래밍',
  'design': '디자인', 'animation': '애니메이션', '3d': '3d',

  // 동작 관련
  'generate': '생성', 'generation': '생성', 'create': '제작', 'creation': '제작',
  'edit': '편집', 'editing': '편집', 'write': '작성', 'writing': '글쓰기',
  'translate': '번역', 'translation': '번역', 'summarize': '요약', 'summary': '요약',
  'search': '검색', 'analyze': '분석', 'analysis': '분석', 'research': '리서치',
  'automate': '자동화', 'automation': '자동화', 'build': '빌드', 'develop': '개발',
  'convert': '변환', 'remove': '제거', 'enhance': '향상', 'upscale': '업스케일',
  'clone': '클론', 'record': '녹음', 'transcribe': '전사', 'dub': '더빙',

  // AI 도메인
  'prompt': '프롬프트', 'model': '모델', 'ai': 'ai', 'chatbot': '챗봇',
  'workflow': '워크플로우', 'template': '템플릿', 'plugin': '플러그인',
  'api': 'api', 'finetune': '파인튜닝', 'finetuning': '파인튜닝',
  'embedding': '임베딩', 'rag': 'rag', 'agent': '에이전트',
  'nocode': '노코드', 'lowcode': '로우코드',

  // 콘텐츠 유형
  'blog': '블로그', 'email': '이메일', 'presentation': '프레젠테이션',
  'slide': '슬라이드', 'report': '보고서', 'document': '문서',
  'resume': '이력서', 'cover letter': '자기소개서',
  'thumbnail': '썸네일', 'logo': '로고', 'banner': '배너',
  'poster': '포스터', 'icon': '아이콘', 'illustration': '일러스트',
  'avatar': '아바타', 'character': '캐릭터', 'background': '배경',
  'subtitle': '자막', 'caption': '캡션', 'shorts': '쇼츠', 'reel': '릴스',

  // 마케팅
  'marketing': '마케팅', 'advertising': '광고', 'ad': '광고', 'ads': '광고',
  'seo': 'seo', 'sns': 'sns', 'campaign': '캠페인', 'copywriting': '카피라이팅',
  'branding': '브랜딩', 'headline': '헤드라인',

  // 기타
  'free': '무료', 'paid': '유료', 'beginner': '초보', 'tutorial': '튜토리얼',
  'review': '리뷰', 'comparison': '비교', 'recommend': '추천',
  'recipe': '레시피', 'tip': '팁', 'guide': '가이드', 'howto': '방법',
  'consistent': '일관성', 'consistency': '일관성', 'quality': '품질',
  'productivity': '생산성', 'efficiency': '효율',
};

// ==========================================
// 한글 조사/어미 패턴 (전처리용)
// ==========================================
export const KOREAN_PARTICLES = [
  // 조사 (긴 것부터 매칭)
  '에서는', '으로는', '에서도', '으로도', '이라는', '이라고',
  '에서', '으로', '부터', '까지', '에게', '한테', '보다', '처럼', '같이', '만큼',
  '이랑', '하고', '이나', '이든', '이라',
  '은', '는', '이', '가', '을', '를', '에', '의', '도', '만', '로', '와', '과',
  '요', '고', '며', '서', '니', '면',
];

// 한글 동사/형용사 어미 패턴
export const KOREAN_VERB_ENDINGS = [
  // 긴 것부터
  '하세요', '해주세요', '해볼까요', '할까요', '합니다', '합니까',
  '했어요', '했습니다', '하겠어요', '드립니다', '드려요',
  '인데요', '인데', '이에요', '이요',
  '어서', '아서', '으면', '니까', '지만', '는데', '하게', '하면',
  '하고', '해서', '해야', '하는', '하지', '해도', '할지', '할때',
  '어요', '아요', '에요', '세요',
  '겠어', '었어', '았어',
];

// ==========================================
// AI 서비스 Alias 매핑 (216개 전체)
// ==========================================
export const AI_TOOL_ALIASES: Record<string, string[]> = {
  // ─── 대화형 AI ───
  'chatgpt': [
    'chatgpt', 'chat gpt', 'chat-gpt',
    'gpt', 'gpt-4', 'gpt4', 'gpt-4o', 'gpt4o', 'gpt-3.5', 'gpt3.5', 'gpt-o1', 'o1', 'o3',
    '챗gpt', '챗지피티', '지피티', '챗 지피티',
    'openai', 'open ai', '오픈ai',
  ],
  'claude': [
    'claude', 'claude ai', 'claude-ai',
    '클로드', '쿨루드', '클로드ai',
    'claude code', 'claudecode', 'claude-code',
    '클로드코드', '클로드 code', '클로드 코드',
    'anthropic', '앤쓰로픽', '앤트로픽',
    'claude sonnet', 'claude opus', 'claude haiku',
  ],
  'gemini': [
    'gemini', 'gemini ai', 'gemini-ai',
    '제미나이', '제미니', '지미나이', '지미니',
    'bard', '바드',
    'google ai', 'google gemini', '구글 제미나이', '구글 지미니',
  ],
  'perplexity': [
    'perplexity', 'perplexity ai', 'perplexity-ai',
    '퍼플렉시티', '퍼플렉서티', '펄플렉시티',
  ],
  'microsoft-copilot': [
    'copilot', 'co-pilot', 'co pilot',
    '코파일럿', '코-파일럿', '코 파일럿',
    'bing chat', '빙챗', '빙 챗',
    'microsoft copilot', '마이크로소프트 코파일럿', 'ms copilot',
  ],
  'grok': [
    'grok', 'grok ai', '그록', '그로크',
    'xai', 'x ai',
  ],
  'poe': [
    'poe', 'poe ai', '포이', '포에',
    'quora poe',
  ],
  'huggingchat': [
    'huggingchat', 'hugging chat', '허깅챗', '허깅 챗',
    'huggingface', 'hugging face', '허깅페이스',
  ],
  'you-com': [
    'you.com', 'youcom', '유닷컴',
  ],
  'coze': [
    'coze', 'coze ai', '코즈',
  ],
  'dwijibgi': [
    '뒤집기', 'dwijibgi',
  ],
  'kimi': [
    'kimi', 'kimi ai', '키미',
  ],
  'pi': [
    'pi ai', '파이 ai', 'inflection',
  ],
  'character-ai': [
    'character ai', 'character.ai', 'characterai', '캐릭터ai', '캐릭터 ai',
  ],

  // ─── 글쓰기/문서 ───
  'notion-ai': [
    'notion ai', 'notion-ai', 'notionai', 'notion',
    '노션 ai', '노션ai', '노션',
  ],
  'jasper': [
    'jasper', 'jasper ai', 'jasper-ai', 'jasperai',
    '재스퍼', '재스퍼ai', '재스퍼 ai',
  ],
  'copy-ai': [
    'copy.ai', 'copy ai', 'copyai', '카피ai', '카피 ai',
  ],
  'writesonic': [
    'writesonic', 'write sonic', '라이트소닉',
  ],
  'grammarly': [
    'grammarly', '그래머리', '그래멀리', 'grammarly ai',
  ],
  'quillbot': [
    'quillbot', 'quill bot', '퀼봇', '퀄봇',
  ],
  'rytr': [
    'rytr', '라이터', 'rytr ai',
  ],
  'wordtune': [
    'wordtune', 'word tune', '워드튠',
  ],
  'sudowrite': [
    'sudowrite', 'sudo write', '수도라이트',
  ],
  'hyperwrite': [
    'hyperwrite', 'hyper write', '하이퍼라이트',
  ],
  'jenni-ai': [
    'jenni ai', 'jenni', 'jenniai', '제니ai',
  ],
  'compose-ai': [
    'compose ai', 'composeai', '컴포즈ai',
  ],
  'moonbeam': [
    'moonbeam', '문빔',
  ],
  'novelai': [
    'novelai', 'novel ai', '노벨ai',
  ],
  'lex': [
    'lex ai', 'lex editor',
  ],

  // ─── 회의/음성 ───
  'otter-ai': [
    'otter.ai', 'otter ai', 'otterai', '오터ai', '오터 ai',
  ],
  'fireflies-ai': [
    'fireflies', 'fireflies.ai', 'firefliesai', '파이어플라이즈',
  ],
  'tldv': [
    'tldv', 'tl;dv', 'tl dv',
  ],
  'clova-note': [
    'clova note', 'clovanote', '클로바노트', '클로바 노트', 'naver clova note',
  ],
  'typecast': [
    '타입캐스트', 'typecast', 'type cast',
  ],
  'krisp': [
    'krisp', '크리스프',
  ],

  // ─── 이미지 생성 ───
  'midjourney': [
    'midjourney', 'mid-journey', 'mid journey',
    '미드저니', '미드-저니', '미드 저니',
    'mj',
  ],
  'dall-e-3': [
    'dall-e', 'dalle', 'dall e', 'dalle-2', 'dalle-3', 'dall-e 3', 'dall-e-3',
    '달리', '달-리', '달리2', '달리3',
  ],
  'stable-diffusion': [
    'stable diffusion', 'stablediffusion', 'stable-diffusion',
    '스테이블 디퓨전', '스테이블디퓨전', '스테이블-디퓨전',
    'sd', 'sd1.5', 'sdxl', 'sd3',
  ],
  'leonardo-ai': [
    'leonardo', 'leonardo ai', 'leonardo-ai', 'leonardo.ai',
    '레오나르도', '레오나르도ai', '레오나르도 ai',
  ],
  'ideogram': [
    'ideogram', 'ideogram ai', '아이디오그램',
  ],
  'adobe-firefly': [
    'adobe firefly', 'firefly', '어도비 파이어플라이', '파이어플라이',
  ],
  'krea-ai': [
    'krea', 'krea ai', '크레아',
  ],
  'playground-ai': [
    'playground ai', 'playground', '플레이그라운드',
  ],
  'bing-image-creator': [
    'bing image creator', 'bing image', '빙 이미지', '빙이미지',
  ],
  'flux': [
    'flux', 'flux ai', '플럭스', 'flux.1', 'flux1',
  ],
  'remove-bg': [
    'remove.bg', 'removebg', 'remove bg', '리무브bg',
  ],
  'photoroom': [
    'photoroom', 'photo room', '포토룸',
  ],
  'clipdrop': [
    'clipdrop', 'clip drop', '클립드롭',
  ],
  'dreamstudio': [
    'dreamstudio', 'dream studio', '드림스튜디오',
  ],
  'freepik-ai': [
    'freepik', 'freepik ai', '프리픽',
  ],
  'invokeai': [
    'invokeai', 'invoke ai', '인보크ai',
  ],

  // ─── 영상 생성/편집 ───
  'runway-ml': [
    'runway', 'runway ml', 'runwayml', 'runway-ml',
    '런웨이', '런웨이ml', '런웨이 ml',
  ],
  'capcut': [
    'capcut', 'cap cut', '캡컷', '캡 컷',
  ],
  'vrew': [
    'vrew', 'v-rew', '브류', '브루',
  ],
  'pika': [
    'pika', 'pika labs', 'pikalabs',
    '피카', '피카랩스', '피카 랩스',
  ],
  'sora': [
    'sora', 'sora ai', '소라', 'openai sora',
  ],
  'luma-dream-machine': [
    'luma', 'luma dream machine', 'luma ai', '루마', '루마ai',
    'dream machine', '드림머신',
  ],
  'kling-ai': [
    'kling', 'kling ai', '클링', '클링ai',
  ],
  'heygen': [
    'heygen', 'hey gen', '헤이젠', '헤이 젠',
  ],
  'synthesia': [
    'synthesia', '신세시아', '신시시아', '신테시아',
  ],
  'd-id': [
    'd-id', 'did', 'd id', '디아이디',
  ],
  'descript': [
    'descript', '디스크립트',
  ],
  'opus-clip': [
    'opus clip', 'opusclip', '오퍼스클립', '오퍼스 클립',
  ],
  'invideo-ai': [
    'invideo', 'invideo ai', '인비디오',
  ],
  'topaz-video-ai': [
    'topaz', 'topaz video', '토파즈',
  ],
  'pictory': [
    'pictory', 'pictory ai', '픽토리',
  ],
  'captions': [
    'captions app', 'captions ai',
  ],
  'vizard': [
    'vizard', 'vizard ai', '비자드',
  ],
  'submagic': [
    'submagic', '서브매직',
  ],
  'vidyo-ai': [
    'vidyo', 'vidyo.ai', '비디오ai',
  ],
  'wisecut': [
    'wisecut', '와이즈컷',
  ],
  'twelve-labs': [
    'twelve labs', 'twelvelabs', '트웰브랩스',
  ],
  'fliki': [
    'fliki', 'fliki ai', '플리키',
  ],

  // ─── 음성/음악 ───
  'suno-ai': [
    'suno', 'suno ai', 'sunoai',
    '수노', '수노ai', '수노 ai', '슈노',
  ],
  'udio': [
    'udio', 'udio ai', 'udioai',
    '우디오', '유디오', '우디오ai',
  ],
  'elevenlabs': [
    'elevenlabs', 'eleven labs', '일레븐랩스', '일레븐 랩스',
  ],
  'aiva': [
    'aiva', 'aiva ai', '아이바',
  ],
  'mubert': [
    'mubert', '뮤버트',
  ],
  'soundraw': [
    'soundraw', '사운드로',
  ],
  'boomy': [
    'boomy', '부미',
  ],
  'soundful': [
    'soundful', '사운드풀',
  ],
  'beatoven-ai': [
    'beatoven', 'beatoven.ai', '비토벤ai',
  ],
  'loudly': [
    'loudly', 'loudly ai', '라우들리',
  ],
  'stable-audio': [
    'stable audio', '스테이블 오디오',
  ],
  'coqui-tts': [
    'coqui', 'coqui tts', '코키',
  ],
  'play-ht': [
    'play.ht', 'playht', 'play ht', '플레이ht',
  ],
  'murf-ai': [
    'murf', 'murf ai', '머프ai',
  ],
  'resemble-ai': [
    'resemble', 'resemble ai', '리셈블',
  ],
  'lovo': [
    'lovo', 'lovo ai', '로보',
  ],
  'listnr': [
    'listnr', '리스너',
  ],
  'speechify': [
    'speechify', '스피치파이',
  ],
  'podcastle': [
    'podcastle', '팟캐슬',
  ],
  'splash': [
    'splash', 'splash ai',
  ],
  'amper': [
    'amper', 'amper music', '앰퍼',
  ],

  // ─── 코딩 도구 ───
  'github-copilot': [
    'github copilot', 'github-copilot', 'githubcopilot',
    '깃허브 코파일럿', '깃허브코파일럿', '깃헙 코파일럿',
    'gh copilot',
  ],
  'cursor': [
    'cursor', 'cursor ai', 'cursor-ai', 'cursorai',
    '커서', '커서ai', '커서 ai',
  ],
  'v0': [
    'v0', 'v0.dev', 'v0dev',
    'vercel v0', '버셀 v0', '버셀v0',
    '브이제로', 'v제로',
  ],
  'replit': [
    'replit', 'repl.it', 'repl',
    '레플릿', '레플', '리플릿',
  ],
  'tabnine': [
    'tabnine', 'tab nine', '탭나인',
  ],
  'windsurf': [
    'windsurf', 'windsurf ai', '윈드서프',
    'codeium', '코디움',
  ],
  'amazon-q-developer': [
    'amazon q', 'amazon q developer', '아마존 q',
    'codewhisperer', 'code whisperer',
  ],
  'bolt-new': [
    'bolt.new', 'bolt new', 'boltnew', '볼트뉴', '볼트 뉴',
  ],
  'lovable': [
    'lovable', 'lovable ai', 'lovable.dev', '러버블',
  ],
  'continue': [
    'continue dev', 'continue ai',
  ],
  'pieces': [
    'pieces', 'pieces for developers',
  ],
  'cody': [
    'cody', 'sourcegraph cody', '코디',
  ],
  'blackbox-ai': [
    'blackbox', 'blackbox ai', '블랙박스ai',
  ],
  'devin': [
    'devin', 'devin ai', '데빈', 'cognition',
  ],
  'claude-code': [
    'claude code', 'claudecode', '클로드코드',
  ],
  'aider': [
    'aider', '에이더',
  ],
  'phind': [
    'phind', '파인드',
  ],

  // ─── 번역 ───
  'deepl': [
    'deepl', 'deep l',
    '딥엘', '디플', '딥 엘',
  ],
  'deepl-write': [
    'deepl write', '딥엘 라이트',
  ],
  'papago': [
    'papago', '파파고', 'naver papago', '네이버 파파고',
  ],
  'google-translate': [
    'google translate', '구글 번역', '구글번역',
  ],
  'flitto': [
    'flitto', '플리토',
  ],
  'smartcat': [
    'smartcat', '스마트캣',
  ],
  'lingva-translate': [
    'lingva', 'lingva translate',
  ],
  'itranslate': [
    'itranslate', '아이트랜슬레이트',
  ],
  'reverso': [
    'reverso', '리버소',
  ],

  // ─── 데이터/리서치 ───
  'julius-ai': [
    'julius', 'julius ai', '줄리어스',
  ],
  'tableau': [
    'tableau', '태블로',
  ],
  'google-notebooklm': [
    'notebooklm', 'notebook lm', '노트북lm', '노트북 lm',
    'google notebooklm',
  ],
  'obviously-ai': [
    'obviously ai', '옵비어슬리',
  ],
  'rows-ai': [
    'rows ai', 'rows',
  ],
  'power-bi': [
    'power bi', 'powerbi', '파워bi', '파워 bi',
  ],
  'hex': [
    'hex ai',
  ],
  'monkeylearn': [
    'monkeylearn', '몽키런',
  ],
  'datarobot': [
    'datarobot', 'data robot', '데이터로봇',
  ],
  'consensus': [
    'consensus', '컨센서스',
  ],
  'elicit': [
    'elicit', 'elicit ai', '엘리싯',
  ],
  'scholarcy': [
    'scholarcy', '스칼라시',
  ],
  'scispace': [
    'scispace', 'typeset', '사이스페이스',
  ],
  'researchrabbit': [
    'researchrabbit', 'research rabbit', '리서치래빗',
  ],
  'semantic-scholar': [
    'semantic scholar', '시멘틱 스칼라',
  ],
  'equals': [
    'equals ai',
  ],
  'lookup': [
    'lookup ai',
  ],
  'coefficient': [
    'coefficient',
  ],

  // ─── 프레젠테이션 ───
  'gamma': [
    'gamma', 'gamma ai', 'gamma.app', '감마', '감마ai',
  ],
  'beautiful-ai': [
    'beautiful.ai', 'beautiful ai', '뷰티풀ai',
  ],
  'slidesai': [
    'slidesai', 'slides ai', '슬라이드ai',
  ],
  'tome': [
    'tome', 'tome ai', '톰',
  ],
  'prezi-ai': [
    'prezi', 'prezi ai', '프레지',
  ],
  'decktopus': [
    'decktopus', '덱토퍼스',
  ],
  'pitch': [
    'pitch ai', 'pitch deck',
  ],
  'napkin-ai': [
    'napkin', 'napkin ai', '냅킨ai',
  ],

  // ─── 생산성/협업 ───
  'canva-ai': [
    'canva', 'canva ai', '캔바', '캔바ai',
  ],
  'zapier-ai': [
    'zapier', 'zapier ai', '재피어',
  ],
  'make': [
    'make.com', 'make ai', 'integromat',
  ],
  'loom-ai': [
    'loom', 'loom ai', '룸',
  ],
  'miro-ai': [
    'miro', 'miro ai', '미로',
  ],
  'tally': [
    'tally', 'tally ai', '탈리',
  ],
  'typeform': [
    'typeform', '타입폼',
  ],
  'scribe': [
    'scribe', 'scribe ai', '스크라이브',
  ],
  'reclaim-ai': [
    'reclaim', 'reclaim ai', '리클레임',
  ],
  'superhuman': [
    'superhuman', '슈퍼휴먼',
  ],
  'perplexity-pages': [
    'perplexity pages', '퍼플렉시티 페이지',
  ],
  'coda-ai': [
    'coda', 'coda ai', '코다',
  ],
  'mem-ai': [
    'mem ai', 'mem.ai',
  ],
  'whimsical-ai': [
    'whimsical', 'whimsical ai', '윔지컬',
  ],
  'n8n': [
    'n8n', '엔에이트엔',
  ],
  'relay': [
    'relay ai',
  ],

  // ─── 로컬 AI / 오픈소스 ───
  'autogpt': [
    'autogpt', 'auto gpt', 'auto-gpt', '오토gpt',
  ],
  'langchain': [
    'langchain', 'lang chain', '랭체인',
  ],
  'ollama': [
    'ollama', '올라마',
  ],
  'gpt4all': [
    'gpt4all', 'gpt-4-all', 'gpt 4 all',
  ],
  'llamaindex': [
    'llamaindex', 'llama index', '라마인덱스',
  ],
  'flowise': [
    'flowise', '플로와이즈',
  ],
  'langflow': [
    'langflow', '랭플로',
  ],
  'localai': [
    'localai', 'local ai', '로컬ai',
  ],
  'lm-studio': [
    'lm studio', 'lmstudio', '엘엠스튜디오',
  ],

  // ─── 한국 서비스 ───
  'wrtn': [
    '뤼튼', 'wrtn', 'riton', '라이튼', '류튼',
    '뤼튼ai', '뤼튼 ai',
  ],
  'clova-x': [
    '클로바x', '클로바 x', 'clova x', 'clovax', 'clova-x',
    'naver clova', '네이버 클로바', '네이버클로바',
  ],
  'askup': [
    'askup', 'ask up', 'ask-up',
    '애스크업', '에스크업', '아스크업', '애스크 업',
  ],

  // ─── 마케팅 ───
  'adcreative-ai': [
    'adcreative', 'adcreative.ai', '애드크리에이티브',
  ],
  'predis-ai': [
    'predis', 'predis.ai', '프레디스',
  ],
  'pencil': [
    'pencil ai',
  ],
  'surfer-seo': [
    'surfer seo', 'surfer', '서퍼seo',
  ],
  'frase': [
    'frase', 'frase io', '프레이즈',
  ],
  'marketmuse': [
    'marketmuse', '마켓뮤즈',
  ],
  'clearscope': [
    'clearscope', '클리어스코프',
  ],
  'lavender': [
    'lavender ai', 'lavender',
  ],
  'instantly': [
    'instantly ai', 'instantly',
  ],
  'taplio': [
    'taplio', '타플리오',
  ],

  // ─── 교육 ───
  'khan-academy-ai': [
    'khan academy', 'khanmigo', '칸아카데미', '칸 아카데미',
  ],
  'duolingo-max': [
    'duolingo', 'duolingo max', '듀오링고',
  ],
  'quizlet-ai': [
    'quizlet', 'quizlet ai', '퀴즐렛',
  ],
  'studyable': [
    'studyable', '스터디어블',
  ],
  'knowt': [
    'knowt', '노트',
  ],
  'revision-ai': [
    'revision ai',
  ],

  // ─── 디자인 UX ───
  'uizard': [
    'uizard', '유아이자드',
  ],
  'diagram': [
    'diagram ai', 'diagram',
  ],
  'galileo-ai': [
    'galileo', 'galileo ai', '갈릴레오',
  ],
  'magician': [
    'magician', 'magician figma',
  ],

  // ─── 커머스/사진 ───
  'booth-ai': [
    'booth.ai', 'booth ai',
  ],
  'cleanup-pictures': [
    'cleanup.pictures', 'cleanup pictures',
  ],
  'designify': [
    'designify',
  ],
  'scenario': [
    'scenario', 'scenario gg',
  ],

  // ─── 고객서비스 ───
  'intercom-fin': [
    'intercom fin', 'intercom', '인터콤',
  ],
  'zendesk-ai': [
    'zendesk', 'zendesk ai', '젠데스크',
  ],
  'ada': [
    'ada ai', 'ada support',
  ],
  'kustomer': [
    'kustomer', '커스토머',
  ],

  // ─── HR ───
  'hirevue': [
    'hirevue', '하이어뷰',
  ],
  'paradox': [
    'paradox ai', 'paradox',
  ],
  'eightfold': [
    'eightfold', 'eightfold ai',
  ],

  // ─── 3D/게임 ───
  'csm-ai': [
    'csm', 'csm ai',
  ],
  'spline-ai': [
    'spline', 'spline ai', '스플라인',
  ],
  'kaedim': [
    'kaedim', '케이디엠',
  ],
  'rosebud-ai': [
    'rosebud', 'rosebud ai', '로즈버드',
  ],

  // ─── 법률/의료 ───
  'harvey': [
    'harvey', 'harvey ai', '하비ai',
  ],
  'donotpay': [
    'donotpay', 'do not pay', '두낫페이',
  ],
  'casetext': [
    'casetext', '케이스텍스트',
  ],
  'nabla': [
    'nabla', '나블라',
  ],
  'glass-health': [
    'glass health', 'glass ai',
  ],

  // ─── 기타 노트/메모 ───
  'mem': [
    'mem app',
  ],
  'reflect': [
    'reflect notes', 'reflect ai',
  ],
  'craft': [
    'craft docs', 'craft ai',
  ],

  // ─── 2026년 2월 신규 서비스 ───
  'seedance': [
    'seedance', 'seedance 2.0', 'seedance2', 'seed dance',
    '시댄스', '씨댄스', 'bytedance video', 'jimeng', '즉몽',
  ],
  'deepseek': [
    'deepseek', 'deep seek', 'deep-seek',
    '딥시크', '딥씩', 'deepseek-r1', 'deepseek r1', 'deepseek v3',
  ],
  'manus-ai': [
    'manus', 'manus ai', 'manus-ai',
    '마누스', '매너스',
  ],
  'perplexity-comet': [
    'comet', 'perplexity comet', 'comet browser',
    '코멧', '코멧 브라우저', '퍼플렉시티 코멧',
  ],
  'trae-ai': [
    'trae', 'trae ai', 'trae ide', 'trae-ai',
    '트래', '트래 ai',
  ],
  'cline': [
    'cline', 'cline ai', 'cline bot',
    '클라인',
  ],
  'recraft-ai': [
    'recraft', 'recraft ai', 'recraft-ai', 'recraft v3',
    '리크래프트',
  ],
  'hailuo-ai': [
    'hailuo', 'hailuo ai', 'hailuo-ai', 'minimax', 'minimax video',
    '하이루오', '하이루오 ai', '미니맥스',
  ],
  'tavus': [
    'tavus', 'tavus ai', 'tavus phoenix', 'phoenix-4',
    '타부스', '타버스',
  ],
  'mistral-ocr': [
    'mistral ocr', 'mistral-ocr', 'mistral ocr 3',
    '미스트랄 ocr',
  ],
  'kiro': [
    'kiro', 'kiro ai', 'kiro ide', 'aws kiro',
    '키로',
  ],
  'qwen': [
    'qwen', 'qwen ai', 'qwen 3.5', 'qwen3.5', 'qwen-3.5',
    '큐원', '큐웬', '통의천문', 'tongyi',
  ],
  'doubao': [
    'doubao', 'doubao ai', 'doubao 2.0', '豆包', 'doubaos',
    '더우바오', '도우바오',
  ],
};

// ==========================================
// 목적(Goal) 키워드 매핑
// ==========================================
export const GOAL_KEYWORDS: Record<string, string[]> = {
  'chat': [
    '대화', '챗봇', '질문', '답변', '상담', '브레인스토밍', '아이디어',
    '토론', '의견', '피드백', '조언', '멘토', '역할극', '롤플레이',
  ],

  'writing': [
    // 문서 작성
    '글쓰기', '작성', '문서', '보고서', '리포트', '기획서', '제안서',
    // 번역/요약
    '요약', '정리', '축약', '교정', '첨삭', '리라이팅',
    // 글 종류
    '이메일', '메일', '블로그', '포스팅', '게시글', '기사', '에세이',
    '콘텐츠', '카피', '카피라이팅', '소설', '시나리오', '대본',
    // 동사
    '쓰다', '적다', '작성하다',
  ],

  'translation': [
    '번역', '통역', '현지화', '로컬라이제이션', '다국어', '영어', '일본어',
    '중국어', '한영', '영한', '한일', '자동번역',
  ],

  'design': [
    // 이미지
    '이미지', '그림', '사진', '포스터',
    // 디자인 작업
    '로고', '썸네일', '배너', '일러스트', '아이콘', '캐릭터', '아바타',
    // 디자인 동사
    '디자인', '꾸미다',
    // 스타일
    '그래픽', '비주얼', 'ui', 'ux',
    // 기능
    '배경제거', '업스케일', '보정',
  ],

  'video': [
    // 영상
    '영상', '비디오', '동영상', '쇼츠', '릴스', '클립',
    // 편집
    '편집', '컷편집', '자막', '모션', '효과', '트랜지션',
    // 유형
    '광고영상', '뮤직비디오', '브이로그', '강의영상', '제품영상',
    // 아바타/AI 영상
    '아바타', '가상인간', '립싱크', '더빙',
  ],

  'music': [
    '음악', '노래', '작곡', '편곡', '비트', '멜로디', '가사',
    '보컬', '반주', 'bgm', '배경음악', '사운드', '오디오',
    '소리', '음성', '목소리', '나레이션', 'tts', '음성합성', '음성클론',
  ],

  'automation': [
    // 자동화
    '자동화', '자동', '반복', '효율',
    // 업무
    '업무', '작업', '프로세스', '워크플로우',
    // 도구
    '스크립트', '매크로', '봇', '연동', '통합', '자동처리',
  ],

  'coding': [
    // 코딩
    '코드', '코딩', '프로그래밍', '개발',
    // 작업
    '디버깅', '리뷰', '리팩토링', '테스트', '배포',
    // 언어
    'python', 'javascript', 'java', 'react', 'next', 'typescript',
    // 관련
    '알고리즘', '함수', '클래스', 'api', '라이브러리', '프레임워크',
  ],

  'data': [
    // 조사/리서치
    '조사', '리서치', '분석', '연구',
    // 자료/데이터
    '자료', '정보', '데이터', '논문', '학술',
    // 동사
    '찾다', '검색', '알아보다', '수집',
    // 분석
    '시각화', '대시보드', '통계', '차트', '그래프', '엑셀', '스프레드시트',
  ],

  'presentation': [
    // 발표
    '발표', '프레젠테이션', 'ppt', '슬라이드',
    // 자료
    '발표자료', '피티', '파워포인트', '키노트',
    // 관련
    '인포그래픽', '다이어그램', '플로우차트',
  ],

  'marketing': [
    // 마케팅
    '마케팅', '홍보', '광고', 'seo',
    // SNS
    'sns', '소셜', '인스타', '페이스북', '트위터', '유튜브', '틱톡',
    // 콘텐츠
    '카피', '헤드라인', '제목', '캠페인', '브랜딩', '퍼포먼스',
  ],

  'building': [
    // 제품
    '제품', '서비스', '앱', '웹사이트', '랜딩페이지',
    // 개발
    '만들기', '구축', '빌드', '프로토타입',
    // 방법
    '노코드', '로우코드', 'mvp', '사이드프로젝트',
  ],
};

// ==========================================
// 기능(Feature) 키워드 매핑
// ==========================================
export const FEATURE_KEYWORDS: Record<string, string[]> = {
  'text': [
    '텍스트', '글', '문장', '단어', '내용', '원고', '초안',
    '요약문', '번역문', '교정문',
  ],
  'image': [
    '이미지', '사진', '그림', '일러스트', '포스터', '로고',
    '썸네일', '배너', '아이콘', '캐릭터',
  ],
  'video': [
    '영상', '비디오', '동영상', '클립', '쇼츠', '릴스',
    '광고영상', '뮤직비디오', '강의영상',
  ],
  'code': [
    '코드', '프로그램', '스크립트', '함수', '컴포넌트',
    '알고리즘', '라이브러리',
  ],
  'audio': [
    '음악', '소리', '오디오', '사운드', '음성', '보컬', '나레이션',
    'bgm', '효과음', '팟캐스트',
  ],
};

// ==========================================
// 불용어 (Stopwords)
// ==========================================
export const STOP_WORDS = new Set([
  // 조사
  '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과',
  '의', '도', '만', '까지', '부터', '께서', '에게', '한테', '보다',
  // 대명사
  '그', '저', '나', '너', '우리', '저희', '자신',
  // 동사/형용사
  '있다', '없다', '하다', '되다', '이다', '아니다',
  // 부사
  '정말', '진짜', '너무', '매우', '아주', '조금', '많이', '잘', '못',
  // 일반적 단어 (키워드로 가치 없는)
  '때문', '같다', '것', '거', '수', '등', '좀', '더', '또', '및',
  '안녕', '감사', '부탁', '혹시', '어떻게', '왜', '뭐', '어디', '언제',
  '사용', '활용', '방법', '소개', '설명', '확인', '가능', '필요',
  '싶다', '모르다', '알다', '보다', '주다', '받다', '만들다', '쉽다', '어렵다',
  '좋다', '나쁘다', '크다', '작다', '새로', '다른',
  '합니다', '입니다', '습니다', '입니까', '세요', '해요',
  '그리고', '그래서', '하지만', '그런데', '그래도', '만약', '만일',
  '정도', '이번', '다음', '처음', '요즘', '최근',
  '간단', '복잂', '기본', '고급', '전체', '일부',
]);

// ==========================================
// 헬퍼 함수
// ==========================================

/**
 * 텍스트 정규화 (소문자 + 공백 제거)
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '');
}

/**
 * AI 서비스 슬러그 → 표시 이름
 */
export function getAIToolDisplay(slug: string): string {
  const displayMap: Record<string, string> = {
    'chatgpt': 'ChatGPT', 'claude': 'Claude', 'gemini': 'Gemini',
    'perplexity': 'Perplexity', 'microsoft-copilot': 'Copilot',
    'grok': 'Grok', 'poe': 'Poe', 'huggingchat': 'HuggingChat',
    'you-com': 'You.com', 'coze': 'Coze', 'kimi': 'Kimi', 'pi': 'Pi',
    'character-ai': 'Character.ai',
    'notion-ai': 'Notion AI', 'jasper': 'Jasper', 'copy-ai': 'Copy.ai',
    'writesonic': 'Writesonic', 'grammarly': 'Grammarly', 'quillbot': 'QuillBot',
    'rytr': 'Rytr', 'wordtune': 'Wordtune', 'sudowrite': 'Sudowrite',
    'hyperwrite': 'Hyperwrite', 'jenni-ai': 'Jenni AI', 'compose-ai': 'Compose AI',
    'moonbeam': 'Moonbeam', 'novelai': 'NovelAI', 'lex': 'Lex',
    'otter-ai': 'Otter.ai', 'fireflies-ai': 'Fireflies.ai', 'tldv': 'tl;dv',
    'clova-note': 'Clova Note', 'typecast': '타입캐스트', 'krisp': 'Krisp',
    'midjourney': 'Midjourney', 'dall-e-3': 'DALL-E 3',
    'stable-diffusion': 'Stable Diffusion', 'leonardo-ai': 'Leonardo.ai',
    'ideogram': 'Ideogram', 'adobe-firefly': 'Adobe Firefly',
    'krea-ai': 'Krea AI', 'playground-ai': 'Playground AI',
    'bing-image-creator': 'Bing Image Creator', 'flux': 'Flux',
    'remove-bg': 'Remove.bg', 'photoroom': 'PhotoRoom', 'clipdrop': 'ClipDrop',
    'dreamstudio': 'DreamStudio', 'freepik-ai': 'Freepik AI', 'invokeai': 'InvokeAI',
    'runway-ml': 'Runway ML', 'capcut': 'CapCut', 'vrew': 'VREW',
    'pika': 'Pika', 'sora': 'Sora', 'luma-dream-machine': 'Luma Dream Machine',
    'kling-ai': 'Kling AI', 'heygen': 'HeyGen', 'synthesia': 'Synthesia',
    'd-id': 'D-ID', 'descript': 'Descript', 'opus-clip': 'Opus Clip',
    'invideo-ai': 'InVideo AI', 'topaz-video-ai': 'Topaz Video AI',
    'pictory': 'Pictory', 'captions': 'Captions', 'vizard': 'Vizard',
    'submagic': 'Submagic', 'vidyo-ai': 'Vidyo.ai', 'wisecut': 'Wisecut',
    'twelve-labs': 'Twelve Labs', 'fliki': 'Fliki',
    'suno-ai': 'Suno AI', 'udio': 'Udio', 'elevenlabs': 'ElevenLabs',
    'aiva': 'AIVA', 'mubert': 'Mubert', 'soundraw': 'Soundraw',
    'boomy': 'Boomy', 'soundful': 'Soundful', 'beatoven-ai': 'Beatoven.ai',
    'loudly': 'Loudly', 'stable-audio': 'Stable Audio', 'coqui-tts': 'Coqui TTS',
    'play-ht': 'Play.ht', 'murf-ai': 'Murf AI', 'resemble-ai': 'Resemble AI',
    'lovo': 'LOVO', 'listnr': 'Listnr', 'speechify': 'Speechify',
    'podcastle': 'Podcastle', 'splash': 'Splash', 'amper': 'Amper',
    'github-copilot': 'GitHub Copilot', 'cursor': 'Cursor', 'v0': 'v0',
    'replit': 'Replit', 'tabnine': 'Tabnine', 'windsurf': 'Windsurf',
    'amazon-q-developer': 'Amazon Q', 'bolt-new': 'Bolt.new', 'lovable': 'Lovable',
    'continue': 'Continue', 'pieces': 'Pieces', 'cody': 'Cody',
    'blackbox-ai': 'Blackbox AI', 'devin': 'Devin', 'claude-code': 'Claude Code',
    'aider': 'Aider', 'phind': 'Phind',
    'deepl': 'DeepL', 'deepl-write': 'DeepL Write', 'papago': 'Papago',
    'google-translate': 'Google 번역', 'flitto': 'Flitto', 'smartcat': 'Smartcat',
    'lingva-translate': 'Lingva', 'itranslate': 'iTranslate', 'reverso': 'Reverso',
    'julius-ai': 'Julius AI', 'tableau': 'Tableau',
    'google-notebooklm': 'NotebookLM', 'obviously-ai': 'Obviously AI',
    'rows-ai': 'Rows AI', 'power-bi': 'Power BI', 'hex': 'Hex',
    'monkeylearn': 'MonkeyLearn', 'datarobot': 'DataRobot',
    'consensus': 'Consensus', 'elicit': 'Elicit', 'scholarcy': 'Scholarcy',
    'scispace': 'SciSpace', 'researchrabbit': 'ResearchRabbit',
    'semantic-scholar': 'Semantic Scholar',
    'gamma': 'Gamma', 'beautiful-ai': 'Beautiful.ai', 'slidesai': 'SlidesAI',
    'tome': 'Tome', 'prezi-ai': 'Prezi AI', 'decktopus': 'Decktopus',
    'pitch': 'Pitch', 'napkin-ai': 'Napkin AI',
    'canva-ai': 'Canva AI', 'zapier-ai': 'Zapier', 'make': 'Make',
    'loom-ai': 'Loom AI', 'miro-ai': 'Miro AI', 'tally': 'Tally',
    'typeform': 'Typeform', 'scribe': 'Scribe', 'reclaim-ai': 'Reclaim AI',
    'superhuman': 'Superhuman', 'coda-ai': 'Coda AI', 'whimsical-ai': 'Whimsical AI',
    'n8n': 'n8n',
    'wrtn': '뤼튼', 'clova-x': '클로바X', 'askup': 'AskUp',
    'dwijibgi': '뒤집기',
    'adcreative-ai': 'AdCreative.ai', 'predis-ai': 'Predis.ai',
    'surfer-seo': 'Surfer SEO', 'frase': 'Frase', 'marketmuse': 'MarketMuse',
    'clearscope': 'Clearscope', 'taplio': 'Taplio',
    'khan-academy-ai': 'Khan Academy', 'duolingo-max': 'Duolingo',
    'quizlet-ai': 'Quizlet', 'studyable': 'Studyable', 'knowt': 'Knowt',
    'autogpt': 'AutoGPT', 'langchain': 'LangChain', 'ollama': 'Ollama',
    'gpt4all': 'GPT4All', 'llamaindex': 'LlamaIndex',
    'flowise': 'Flowise', 'langflow': 'LangFlow', 'localai': 'LocalAI',
    'lm-studio': 'LM Studio',
    'uizard': 'Uizard', 'galileo-ai': 'Galileo AI', 'spline-ai': 'Spline AI',
    'harvey': 'Harvey', 'donotpay': 'DoNotPay',
    'intercom-fin': 'Intercom Fin', 'zendesk-ai': 'Zendesk AI',
  };
  return displayMap[slug] || slug;
}

/**
 * 목적 슬러그 → 표시 이름
 */
export function getGoalDisplay(slug: string): string {
  const displayMap: Record<string, string> = {
    'chat': '아이디어·브레인스토밍',
    'writing': '글쓰기',
    'translation': '번역',
    'design': '디자인',
    'video': '영상',
    'music': '음악·오디오',
    'coding': '코딩',
    'automation': '자동화',
    'data': '데이터·리서치',
    'presentation': '발표',
    'marketing': '마케팅',
    'building': '제품만들기',
  };
  return displayMap[slug] || slug;
}

/**
 * 기능 슬러그 → 표시 이름
 */
export function getFeatureDisplay(slug: string): string {
  const displayMap: Record<string, string> = {
    'text': '텍스트',
    'image': '이미지',
    'video': '영상',
    'code': '코드',
    'audio': '오디오',
  };
  return displayMap[slug] || slug;
}
