#!/usr/bin/env python3
"""Batch 4b: Coding/Dev frameworks, Local LLM runners, AI image/design tools update"""
import json

SEED_PATH = "e:/CLAUDE/AIPICK/data/seed.json"

with open(SEED_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

UPDATES = {
    # ── LANGCHAIN ──
    "langchain": {
        "description": "LLM 앱 개발의 표준 프레임워크. 체인·에이전트·RAG 파이프라인 구축, Python/JS 지원, 100+ 통합 커넥터, 오픈소스 무료",
        "long_description": "LangChain은 대규모 언어 모델(LLM)을 활용한 애플리케이션을 구축하기 위한 오픈소스 프레임워크입니다.\n\n【핵심 기능】\n• Chains: 여러 LLM 호출을 순차적으로 연결하여 복잡한 워크플로우 구성\n• Agents: LLM이 도구(검색, 계산, API 등)를 자율적으로 선택·실행하는 에이전트 시스템\n• RAG(검색 증강 생성): 벡터 DB에서 관련 문서를 검색하여 LLM 답변에 반영\n• Memory: 대화 이력을 저장·관리하여 컨텍스트를 유지하는 메모리 시스템\n• Prompt Templates: 프롬프트를 구조화하여 재사용·관리하는 템플릿 엔진\n• Document Loaders: PDF, 웹페이지, DB 등 100+ 소스에서 데이터를 로드\n• Vector Stores: Pinecone, ChromaDB, Weaviate 등 주요 벡터 DB 통합\n• Output Parsers: LLM 출력을 JSON, 리스트 등 구조화된 형식으로 파싱\n• Callbacks: 실행 과정을 추적·로깅·모니터링하는 콜백 시스템\n• LangSmith: 프로덕션 모니터링·디버깅·평가 플랫폼 (별도 서비스)\n\n【요금제】\n• LangChain 오픈소스: 완전 무료 (MIT 라이선스)\n• LangSmith(모니터링): Free 5K traces/월, Plus $39/월, Enterprise 맞춤",
        "tags": ["LLM 프레임워크", "RAG", "에이전트", "체인", "Python", "JavaScript", "오픈소스", "벡터 DB", "프롬프트 엔지니어링", "AI 개발"],
        "pros": [
            "LLM 앱 개발의 사실상 표준으로 가장 풍부한 생태계와 커뮤니티 보유",
            "100+ 통합 커넥터로 거의 모든 LLM, 벡터 DB, 도구와 연동 가능",
            "RAG, Agent, Chain 등 핵심 패턴이 추상화되어 빠른 프로토타이핑 가능",
            "Python과 JavaScript(TypeScript) 모두 지원하여 백엔드·프론트엔드 통합 용이",
            "LangSmith로 프로덕션 환경의 모니터링·디버깅·A/B 테스트 지원"
        ],
        "cons": [
            "추상화 레이어가 많아 디버깅 시 콜스택이 깊고 복잡함",
            "API가 자주 변경되어 버전 업데이트 시 기존 코드 수정 필요",
            "간단한 LLM 호출에도 프레임워크 오버헤드가 발생할 수 있음",
            "학습 곡선이 있으며 LCEL(LangChain Expression Language) 이해 필요"
        ],
        "usage_tips": [
            "간단한 프로젝트는 Chain보다 LCEL(|파이프 연산자)을 사용하면 더 간결하게 작성할 수 있습니다",
            "RAG 구축 시 RecursiveCharacterTextSplitter로 문서를 적절히 분할하면 검색 정확도가 향상됩니다",
            "Agent에 tool_description을 상세하게 작성하면 도구 선택 정확도가 크게 올라갑니다",
            "LangSmith를 연동하면 프롬프트·체인 실행 과정을 시각적으로 추적하여 디버깅할 수 있습니다",
            "ConversationBufferWindowMemory로 최근 N턴만 유지하면 토큰 비용을 절약할 수 있습니다",
            "streaming=True 옵션으로 스트리밍 응답을 구현하면 사용자 체감 속도가 향상됩니다",
            "여러 LLM을 fallback으로 설정하면 특정 API 장애 시 자동으로 대체 모델로 전환됩니다"
        ],
        "free_quota_detail": "오픈소스 프레임워크 완전 무료 (MIT 라이선스). LangSmith 모니터링: Free 5K traces/월, Plus $39/월. LLM API 비용은 각 제공자별 별도"
    },

    # ── LLAMAINDEX ──
    "llamaindex": {
        "description": "LLM 데이터 연결 프레임워크. RAG 파이프라인 특화, 160+ 데이터 커넥터, 인덱싱·쿼리 엔진, 오픈소스 무료",
        "long_description": "LlamaIndex(구 GPT Index)는 LLM과 외부 데이터를 연결하는 데이터 프레임워크로, RAG 파이프라인 구축에 특화되어 있습니다.\n\n【핵심 기능】\n• Data Connectors: 160+ 소스(PDF, Notion, Slack, DB, API 등)에서 데이터 로드\n• Indexing: 문서를 벡터, 키워드, 트리 등 다양한 인덱스 구조로 변환\n• Query Engine: 자연어 질문을 인덱스에 대해 실행하는 쿼리 엔진\n• Chat Engine: 대화형 인터페이스로 인덱스된 데이터와 대화\n• Agents: 도구를 사용하는 에이전트 시스템 (ReAct, OpenAI function calling)\n• Sub-Question Query: 복잡한 질문을 하위 질문으로 분해하여 답변\n• Response Synthesizer: 여러 소스의 정보를 종합하여 응답 생성\n• Evaluation: 응답 품질 자동 평가 (faithfulness, relevancy)\n• LlamaParse: 복잡한 PDF/문서 파싱 (표, 그래프 포함)\n• LlamaCloud: 매니지드 인덱싱·파싱 서비스\n\n【요금제】\n• LlamaIndex 오픈소스: 완전 무료 (MIT 라이선스)\n• LlamaCloud: Free 1K pages/일, Starter $35/월, Enterprise 맞춤\n• LlamaParse: Free 1K pages/일, 유료 플랜에서 확장",
        "tags": ["RAG", "데이터 프레임워크", "인덱싱", "쿼리 엔진", "Python", "벡터 DB", "문서 파싱", "오픈소스", "LLM 연동", "데이터 커넥터"],
        "pros": [
            "RAG 파이프라인 구축에 최적화된 추상화로 빠른 프로토타이핑 가능",
            "160+ 데이터 커넥터로 거의 모든 형태의 데이터 소스와 연동 가능",
            "Sub-Question, Tree Index 등 고급 쿼리 전략으로 복잡한 질문도 처리",
            "LlamaParse로 표, 그래프 포함 복잡한 문서도 정확하게 파싱",
            "응답 품질 자동 평가(faithfulness, relevancy) 기능 내장"
        ],
        "cons": [
            "에이전트·체인 기능은 LangChain 대비 생태계가 작음",
            "커뮤니티·레퍼런스가 LangChain보다 상대적으로 적음",
            "복잡한 인덱스 구조 선택 시 각 방식의 트레이드오프 이해 필요",
            "LlamaCloud/LlamaParse 고급 기능은 유료 플랜 필요"
        ],
        "usage_tips": [
            "VectorStoreIndex.from_documents()로 5줄 이내에 RAG 파이프라인을 구축할 수 있습니다",
            "SentenceSplitter의 chunk_size를 문서 특성에 맞게 조절하면 검색 정확도가 향상됩니다",
            "as_chat_engine()으로 인덱스를 채팅 인터페이스로 변환하면 대화형 문서 QA가 가능합니다",
            "Sub-Question Query Engine을 사용하면 여러 문서를 비교·분석하는 복잡한 질문도 처리됩니다",
            "LlamaParse를 사용하면 표, 차트가 포함된 PDF에서도 정확한 데이터를 추출할 수 있습니다",
            "evaluation 모듈로 faithfulness 점수를 측정하면 RAG 응답의 환각을 정량적으로 관리할 수 있습니다",
            "create_llama CLI로 풀스택 RAG 앱을 원클릭으로 스캐폴딩할 수 있습니다"
        ],
        "free_quota_detail": "오픈소스 프레임워크 완전 무료 (MIT 라이선스). LlamaParse Free 1K pages/일. LlamaCloud Free 1K pages/일, Starter $35/월. LLM API 비용은 별도"
    },

    # ── FLOWISE ──
    "flowise": {
        "description": "비주얼 LLM 워크플로우 빌더. 드래그앤드롭으로 RAG·챗봇·에이전트 구축, LangChain 기반, 노코드, 오픈소스 무료",
        "long_description": "Flowise는 LangChain/LlamaIndex를 비주얼 인터페이스로 사용할 수 있는 노코드 LLM 앱 빌더입니다.\n\n【핵심 기능】\n• 비주얼 플로우 에디터: 드래그앤드롭으로 LLM 워크플로우를 시각적으로 설계\n• LangChain 통합: LangChain의 Chain, Agent, Tool 노드를 UI에서 연결\n• RAG 빌더: 문서 로더→텍스트 분할→벡터 DB→검색→LLM 파이프라인을 시각적으로 구성\n• 챗봇 임베드: 구축한 챗봇을 웹사이트에 iframe/위젯으로 임베드\n• API 엔드포인트: 각 플로우를 REST API로 자동 노출\n• 멀티 LLM: OpenAI, Anthropic, Ollama, Hugging Face 등 다양한 LLM 연결\n• 메모리: 대화 이력 저장 (Redis, MongoDB, PostgreSQL 등)\n• 도구 통합: 검색, 계산, API 호출 등 에이전트 도구 연결\n• 마켓플레이스: 커뮤니티 제작 플로우 템플릿 공유·다운로드\n• 인증: API 키, 사용자 인증 설정 가능\n\n【요금제】\n• 셀프 호스팅: 완전 무료 (오픈소스, Apache 2.0)\n• FlowiseAI Cloud: Starter $35/월, Pro $65/월, Enterprise 맞춤",
        "tags": ["노코드", "비주얼 빌더", "LangChain", "RAG", "챗봇", "드래그앤드롭", "오픈소스", "API", "LLM 워크플로우", "셀프 호스팅"],
        "pros": [
            "코딩 없이 드래그앤드롭으로 LLM 앱(RAG, 챗봇, 에이전트) 구축 가능",
            "LangChain/LlamaIndex 노드를 시각적으로 연결하여 학습 곡선이 낮음",
            "오픈소스·셀프 호스팅으로 무료 사용 + 데이터 완전 통제",
            "구축한 플로우를 REST API·챗 위젯으로 바로 배포 가능",
            "마켓플레이스에서 커뮤니티 템플릿을 다운로드하여 빠르게 시작 가능"
        ],
        "cons": [
            "복잡한 로직(조건 분기, 루프)은 비주얼 에디터로 표현하기 어려움",
            "LangChain 코드 대비 커스터마이징 자유도가 제한적",
            "대규모 프로덕션 환경에서의 안정성·성능 최적화는 직접 관리 필요",
            "셀프 호스팅 시 서버 운영·업데이트 등 DevOps 역량 필요"
        ],
        "usage_tips": [
            "Docker로 로컬 설치 후 마켓플레이스의 RAG 템플릿을 불러오면 5분 안에 문서 QA 챗봇을 만들 수 있습니다",
            "Ollama 노드를 연결하면 로컬 LLM으로 비용 없이 프로토타이핑할 수 있습니다",
            "챗 위젯 임베드 코드로 기존 웹사이트에 AI 챗봇을 쉽게 추가할 수 있습니다",
            "API 엔드포인트를 활용하면 모바일 앱이나 다른 서비스에서도 플로우를 호출할 수 있습니다",
            "Conversation Memory 노드를 추가하면 이전 대화 맥락을 유지하는 챗봇을 구현할 수 있습니다",
            "여러 문서 로더(PDF, 웹, DB)를 하나의 벡터 스토어에 연결하면 통합 지식베이스를 구축할 수 있습니다"
        ],
        "free_quota_detail": "셀프 호스팅 시 완전 무료 (오픈소스, Apache 2.0). FlowiseAI Cloud: Starter $35/월(기본 기능), Pro $65/월(고급 기능+팀), Enterprise 맞춤"
    },

    # ── LANGFLOW ──
    "langflow": {
        "description": "비주얼 LangChain 빌더. 드래그앤드롭 플로우 설계, 실시간 미리보기, Python 코드 자동 생성, DataStax 통합, 오픈소스",
        "long_description": "Langflow는 LLM 애플리케이션을 비주얼 인터페이스로 설계하고 Python 코드를 자동 생성하는 오픈소스 빌더입니다.\n\n【핵심 기능】\n• 비주얼 플로우 에디터: 컴포넌트를 드래그앤드롭으로 연결하여 LLM 앱 설계\n• 실시간 미리보기: 플로우를 구성하면서 각 노드의 출력을 실시간 확인\n• Python 코드 내보내기: 설계한 플로우를 실행 가능한 Python 코드로 자동 변환\n• 다양한 컴포넌트: LLM, 프롬프트, RAG, 에이전트, 도구, 메모리 등 풍부한 노드\n• 커스텀 컴포넌트: Python 코드로 자체 컴포넌트를 생성하여 플로우에 추가\n• API 배포: 각 플로우를 REST API 엔드포인트로 자동 배포\n• DataStax Astra 통합: 클라우드 벡터 DB와 원활한 연동\n• 멀티 LLM: OpenAI, Anthropic, Google, Ollama, Groq 등 다양한 모델 지원\n• 플레이그라운드: 구축한 플로우를 채팅 인터페이스에서 즉시 테스트\n• Tweaks: API 호출 시 노드 파라미터를 동적으로 오버라이드\n\n【요금제】\n• 셀프 호스팅: 완전 무료 (MIT 라이선스)\n• DataStax Langflow: Free tier 제공, 클라우드 호스팅\n• Enterprise: 맞춤형 가격, 전용 지원",
        "tags": ["비주얼 빌더", "LangChain", "노코드", "Python", "드래그앤드롭", "RAG", "오픈소스", "API 배포", "코드 생성", "DataStax"],
        "pros": [
            "비주얼로 설계한 플로우를 Python 코드로 내보내어 코드 기반 확장 가능",
            "실시간 미리보기로 각 노드의 출력을 즉시 확인하며 디버깅 가능",
            "커스텀 컴포넌트로 Python 코드를 직접 작성하여 자유도 확보",
            "DataStax Astra 통합으로 클라우드 벡터 DB 활용이 원활",
            "MIT 라이선스로 상업적 사용도 완전 자유"
        ],
        "cons": [
            "Flowise 대비 커뮤니티 규모와 마켓플레이스 생태계가 작음",
            "복잡한 멀티스텝 로직은 비주얼 에디터에서 관리하기 어려울 수 있음",
            "DataStax 인수 후 독립 프로젝트 방향성에 대한 불확실성",
            "셀프 호스팅 시 메모리·CPU 요구사항이 높을 수 있음"
        ],
        "usage_tips": [
            "플로우를 Python 코드로 내보내면 프로덕션 환경에서 프레임워크 없이 실행할 수 있습니다",
            "실시간 미리보기로 각 노드의 출력을 확인하면서 프롬프트를 튜닝하면 효율적입니다",
            "커스텀 컴포넌트를 작성하면 외부 API, 사내 시스템 등을 플로우에 통합할 수 있습니다",
            "Tweaks 기능으로 API 호출 시 모델이나 파라미터를 동적으로 변경할 수 있습니다",
            "DataStax Astra Free tier를 활용하면 클라우드 벡터 DB까지 무료로 RAG를 구축할 수 있습니다",
            "플레이그라운드에서 다양한 입력으로 테스트한 후 API로 배포하면 안정적입니다"
        ],
        "free_quota_detail": "셀프 호스팅 완전 무료 (MIT 라이선스). DataStax Langflow 클라우드: Free tier (기본 사용량), 유료 플랜은 DataStax 요금 기준. LLM API 비용 별도"
    },

    # ── OLLAMA ──
    "ollama": {
        "description": "로컬 LLM 실행의 표준 도구. CLI로 Llama 3, Mistral 등 100+ 모델을 한 줄로 다운로드·실행, OpenAI 호환 API 서버, 완전 무료",
        "long_description": "Ollama는 로컬 컴퓨터에서 대규모 언어 모델을 쉽게 다운로드하고 실행할 수 있는 오픈소스 도구입니다.\n\n【핵심 기능】\n• 원클릭 모델 실행: `ollama run llama3` 한 줄로 모델 다운로드·실행\n• 모델 라이브러리: Llama 3, Mistral, Gemma, Phi, Qwen 등 100+ 모델 지원\n• OpenAI 호환 API: localhost:11434에서 OpenAI API 형식의 서버 자동 실행\n• Modelfile: Docker처럼 커스텀 모델 설정 파일로 파라미터·시스템 프롬프트 정의\n• GPU 가속: NVIDIA CUDA, Apple Metal(M1~M4) 자동 감지·최적화\n• 양자화 모델: GGUF 포맷의 경량화 모델로 일반 PC에서도 실행 가능\n• 멀티모달: LLaVA 등 비전 모델로 이미지 입력 지원\n• Embedding: nomic-embed-text 등 임베딩 모델 실행\n• 크로스 플랫폼: macOS, Linux, Windows 지원\n• REST API: 프로그래밍 언어에 구애받지 않는 HTTP API 제공\n\n【요금제】\n• 완전 무료 (오픈소스, MIT 라이선스)\n• 하드웨어 비용만 사용자 부담",
        "tags": ["로컬 LLM", "오픈소스", "CLI", "API 서버", "Llama", "Mistral", "GPU 가속", "프라이버시", "무료", "GGUF"],
        "pros": [
            "한 줄 명령어로 100+ LLM을 즉시 다운로드·실행할 수 있는 극도의 간편함",
            "OpenAI 호환 API로 기존 코드의 endpoint만 변경하면 로컬 LLM으로 전환 가능",
            "완전 무료·오프라인 실행으로 API 비용 없이 프라이버시 보장",
            "Apple Silicon, NVIDIA GPU 자동 감지로 별도 설정 없이 하드웨어 가속",
            "LangChain, LlamaIndex, Flowise 등 주요 프레임워크와 원활한 통합"
        ],
        "cons": [
            "큰 모델(70B 이상)은 고사양 GPU·RAM이 필요하여 일반 PC에서 실행 어려움",
            "로컬 실행이므로 GPT-4, Claude 등 최상위 클라우드 모델 대비 성능 제한",
            "GUI가 없어 CLI에 익숙하지 않은 사용자에게 진입 장벽",
            "모델 파일이 수 GB~수십 GB로 디스크 공간을 많이 차지"
        ],
        "usage_tips": [
            "`ollama run llama3:8b`로 시작하면 8GB RAM에서도 원활하게 로컬 LLM을 체험할 수 있습니다",
            "Modelfile에서 SYSTEM 프롬프트를 설정하면 특정 역할의 커스텀 챗봇을 만들 수 있습니다",
            "OpenAI 호환 API(localhost:11434/v1)를 활용하면 LangChain, Flowise 등에서 바로 연동됩니다",
            "`ollama list`로 설치된 모델을, `ollama rm 모델명`으로 불필요한 모델을 삭제하여 디스크를 관리하세요",
            "Apple M1~M4 사용자는 별도 설정 없이 Metal GPU 가속이 자동 적용됩니다",
            "embedding 모델(nomic-embed-text)을 실행하면 로컬에서 무료 RAG 파이프라인을 구축할 수 있습니다",
            "여러 모델을 미리 pull해두고 API에서 model 파라미터만 변경하면 모델 비교 테스트가 가능합니다"
        ],
        "free_quota_detail": "완전 무료 오픈소스 (MIT 라이선스). 모델 다운로드·실행·API 서버 모두 무료. 하드웨어(GPU, RAM, 디스크)만 사용자 부담. 클라우드 API 비용 없음"
    },

    # ── GPT4ALL ──
    "gpt4all": {
        "description": "로컬 LLM 데스크톱 앱. GUI로 손쉽게 AI 채팅, CPU 전용 실행, 문서 기반 RAG, 완전 오프라인·프라이버시, 무료",
        "long_description": "GPT4All은 Nomic AI가 개발한 로컬 LLM 데스크톱 애플리케이션으로, 기술 지식 없이도 로컬에서 AI를 사용할 수 있습니다.\n\n【핵심 기능】\n• 데스크톱 GUI: 설치 후 바로 사용 가능한 직관적인 채팅 인터페이스\n• CPU 전용 실행: GPU 없이 일반 노트북 CPU만으로 LLM 실행 가능\n• 모델 브라우저: 앱 내에서 Llama, Mistral, Falcon 등 모델을 클릭으로 다운로드\n• LocalDocs: 로컬 폴더의 문서를 인덱싱하여 RAG 기반 질의응답\n• 완전 오프라인: 인터넷 연결 없이 100% 로컬에서 동작\n• 프라이버시: 데이터가 외부로 전송되지 않아 개인정보 보호\n• API 서버: 로컬 API 서버로 다른 앱에서 호출 가능\n• 크로스 플랫폼: Windows, macOS, Ubuntu 지원\n• GPU 선택 지원: NVIDIA/AMD GPU가 있으면 가속 활용\n• 플러그인: 코드 인터프리터 등 확장 기능\n\n【요금제】\n• 완전 무료 (오픈소스, MIT 라이선스)\n• 하드웨어 비용만 사용자 부담",
        "tags": ["로컬 LLM", "데스크톱", "GUI", "CPU", "프라이버시", "오프라인", "무료", "오픈소스", "RAG", "Nomic AI"],
        "pros": [
            "GUI 기반으로 CLI 지식 없이도 누구나 로컬 LLM을 사용할 수 있음",
            "CPU 전용 실행으로 GPU가 없는 일반 노트북에서도 동작",
            "LocalDocs로 로컬 문서에 대한 RAG 질의응답을 코딩 없이 구현",
            "완전 오프라인 실행으로 민감한 데이터도 안전하게 처리",
            "앱 내 모델 브라우저에서 클릭만으로 모델 설치·관리 가능"
        ],
        "cons": [
            "CPU 전용 모드에서는 응답 속도가 느림 (GPU 대비)",
            "Ollama, LM Studio 대비 지원 모델 수와 업데이트 속도가 느림",
            "고급 파라미터(temperature, top_p 등) 조절 옵션이 제한적",
            "대규모 문서의 LocalDocs 인덱싱 시 시간이 오래 걸릴 수 있음"
        ],
        "usage_tips": [
            "GPU가 없는 노트북에서 AI를 체험하고 싶다면 GPT4All이 가장 쉬운 선택입니다",
            "LocalDocs에 업무 문서 폴더를 추가하면 사내 지식베이스 챗봇을 만들 수 있습니다",
            "Mistral 7B 모델을 선택하면 CPU에서도 비교적 빠른 응답을 얻을 수 있습니다",
            "보안이 중요한 환경에서 인터넷을 차단한 채 오프라인으로 AI를 활용할 수 있습니다",
            "API 서버를 활성화하면 Python, JavaScript 등에서 GPT4All을 프로그래밍적으로 호출할 수 있습니다",
            "여러 모델을 다운로드해두고 대화 중 모델을 전환하면서 비교 테스트할 수 있습니다"
        ],
        "free_quota_detail": "완전 무료 오픈소스 (MIT 라이선스). 데스크톱 앱·모델 다운로드·LocalDocs RAG 모두 무료. GPU 없이 CPU로 실행 가능. 하드웨어만 사용자 부담"
    },

    # ── LOCALAI ──
    "localai": {
        "description": "로컬 AI API 서버. OpenAI 호환 REST API, 셀프 호스팅, LLM·이미지·음성·임베딩 통합, Docker 배포, 완전 무료 오픈소스",
        "long_description": "LocalAI는 OpenAI API와 호환되는 로컬 AI 추론 서버로, 다양한 AI 모델을 하나의 API로 통합 실행합니다.\n\n【핵심 기능】\n• OpenAI 호환 API: /v1/chat/completions, /v1/images/generations 등 동일 엔드포인트\n• 멀티모달: 텍스트 생성, 이미지 생성(Stable Diffusion), TTS, STT, 임베딩 통합\n• Docker 배포: docker-compose 한 줄로 서버 시작\n• 모델 갤러리: 사전 구성된 모델을 갤러리에서 선택·다운로드\n• GGUF/GPTQ 지원: 양자화 모델로 일반 하드웨어에서도 실행\n• GPU 가속: NVIDIA CUDA, AMD ROCm 지원\n• CPU 추론: GPU 없이 CPU만으로 실행 가능\n• Function Calling: OpenAI의 함수 호출 API 호환\n• Embedding: 텍스트 임베딩 모델 실행으로 RAG 구축 지원\n• P2P 추론: 여러 노드에 분산하여 대형 모델 실행\n\n【요금제】\n• 완전 무료 (오픈소스, MIT 라이선스)\n• 하드웨어 비용만 사용자 부담",
        "tags": ["로컬 AI", "OpenAI 호환", "API 서버", "셀프 호스팅", "Docker", "오픈소스", "멀티모달", "프라이버시", "무료", "임베딩"],
        "pros": [
            "OpenAI API 호환으로 기존 코드의 base_url만 변경하면 로컬 전환 가능",
            "LLM, 이미지, 음성, 임베딩을 하나의 API 서버에서 통합 제공",
            "Docker 배포로 서버 환경 구축이 간편하고 재현 가능",
            "GPU 없이 CPU만으로도 실행 가능하여 하드웨어 요구사항이 유연",
            "완전 무료·셀프 호스팅으로 API 비용 없이 프라이버시 보장"
        ],
        "cons": [
            "Ollama 대비 초기 설정이 복잡하고 모델 관리 UX가 떨어짐",
            "모든 기능을 통합하다 보니 각 개별 기능의 최적화가 전문 도구 대비 부족",
            "문서화가 빠르게 변하고 불완전한 부분이 있음",
            "대형 모델의 로컬 실행은 고사양 하드웨어 필요"
        ],
        "usage_tips": [
            "docker-compose로 시작하면 5분 안에 OpenAI 호환 API 서버를 로컬에 구축할 수 있습니다",
            "기존 OpenAI SDK 코드에서 base_url만 localhost로 변경하면 바로 로컬 LLM을 사용할 수 있습니다",
            "모델 갤러리에서 원하는 모델을 YAML 설정으로 선택하면 자동 다운로드·설정됩니다",
            "Stable Diffusion 모델을 추가하면 이미지 생성 API도 로컬에서 제공할 수 있습니다",
            "임베딩 모델을 함께 실행하면 로컬에서 완전한 RAG 파이프라인을 무료로 운영할 수 있습니다",
            "Function Calling을 활용하면 로컬 LLM으로도 에이전트 시스템을 구축할 수 있습니다",
            "P2P 추론으로 여러 PC의 자원을 합쳐 대형 모델을 분산 실행할 수 있습니다"
        ],
        "free_quota_detail": "완전 무료 오픈소스 (MIT 라이선스). LLM·이미지·음성·임베딩 API 모두 무료. Docker로 배포. GPU 없이 CPU로도 실행 가능. 하드웨어만 사용자 부담"
    },

    # ── LM STUDIO ──
    "lm-studio": {
        "description": "로컬 LLM 데스크톱 관리자. GUI로 GGUF 모델 검색·다운로드·실행, 파라미터 튜닝, OpenAI 호환 API, 개인 무료",
        "long_description": "LM Studio는 로컬에서 LLM을 쉽게 탐색·다운로드·실행할 수 있는 데스크톱 애플리케이션입니다.\n\n【핵심 기능】\n• 모델 디스커버리: Hugging Face에서 GGUF 모델을 앱 내에서 검색·다운로드\n• 채팅 UI: 세련된 ChatGPT 스타일 채팅 인터페이스\n• 파라미터 튜닝: Temperature, Top-P, Top-K, 반복 패널티 등 세밀한 조절\n• OpenAI 호환 API: 로컬 서버로 OpenAI API 형식 제공\n• 모델 비교: 여러 모델을 나란히 실행하여 출력 비교\n• 시스템 프롬프트: 커스텀 시스템 프롬프트 설정 및 프리셋 관리\n• GPU 오프로딩: GPU 레이어 수를 수동으로 조절하여 VRAM 최적화\n• 크로스 플랫폼: Windows, macOS, Linux 지원\n• 모델 관리: 설치된 모델 목록, 크기, 양자화 정보 한눈에 관리\n• 대화 히스토리: 대화 기록 저장·관리·내보내기\n\n【요금제】\n• 개인 사용: 무료\n• 비즈니스(상업적 사용): 유료 라이선스 필요 (가격 문의)",
        "tags": ["로컬 LLM", "데스크톱", "GUI", "GGUF", "Hugging Face", "API 서버", "모델 관리", "파라미터 튜닝", "프라이버시", "무료"],
        "pros": [
            "세련된 GUI로 Hugging Face의 GGUF 모델을 검색·다운로드·실행까지 원스톱",
            "파라미터 튜닝 패널이 직관적이어서 모델 성능을 세밀하게 조절 가능",
            "OpenAI 호환 API 서버로 다른 앱·프레임워크와 연동이 간편",
            "모델 비교 기능으로 같은 프롬프트에 대한 여러 모델의 출력을 나란히 비교",
            "개인 사용 완전 무료로 고급 기능까지 모두 제공"
        ],
        "cons": [
            "상업적 사용에는 유료 라이선스가 필요 (개인·학습 목적만 무료)",
            "Ollama 대비 CLI·스크립트 기반 자동화에는 부적합",
            "모델 파일(GGUF)이 수 GB~수십 GB로 디스크 공간을 많이 차지",
            "Ollama보다 모델 업데이트·추가가 느릴 수 있음"
        ],
        "usage_tips": [
            "Hugging Face 검색에서 'Q4_K_M' 양자화를 선택하면 품질과 속도의 최적 균형을 얻을 수 있습니다",
            "GPU 오프로딩 레이어를 조절하면 VRAM 부족 없이 최대 성능을 끌어낼 수 있습니다",
            "모델 비교 모드에서 같은 프롬프트를 여러 모델에 보내면 최적 모델을 쉽게 선택할 수 있습니다",
            "시스템 프롬프트 프리셋을 저장해두면 코딩 도우미, 번역가, 작가 등 역할을 빠르게 전환할 수 있습니다",
            "API 서버를 활성화하고 LangChain·Flowise에서 연동하면 무료 로컬 LLM 백엔드로 활용 가능합니다",
            "Temperature를 0.1~0.3으로 낮추면 코드 생성 등 정확도가 중요한 작업에 적합합니다",
            "채팅 히스토리를 JSON으로 내보내면 프롬프트 테스트 결과를 체계적으로 관리할 수 있습니다"
        ],
        "free_quota_detail": "개인 사용 완전 무료 (모든 기능 포함). GGUF 모델 검색·다운로드·실행·API 서버 무료. 비즈니스·상업적 사용 시 유료 라이선스 필요 (가격 문의)"
    },

    # ── INVOKEAI ──
    "invokeai": {
        "description": "로컬 Stable Diffusion UI. 노드 기반 워크플로우, Unified Canvas, ControlNet, LoRA, 전문 이미지 생성, 오픈소스 무료",
        "long_description": "InvokeAI는 Stable Diffusion을 로컬에서 전문적으로 사용할 수 있는 오픈소스 AI 이미지 생성 도구입니다.\n\n【핵심 기능】\n• 웹 UI: 브라우저 기반의 세련된 이미지 생성 인터페이스\n• Unified Canvas: 무한 캔버스에서 인페인팅, 아웃페인팅, img2img 통합 작업\n• 노드 에디터: 비주얼 노드 기반 워크플로우로 고급 파이프라인 구성\n• ControlNet: 포즈, 엣지, 깊이맵 등으로 이미지 구조를 정밀 제어\n• LoRA/Textual Inversion: 커스텀 모델·스타일을 로드하여 특화 이미지 생성\n• SDXL 지원: Stable Diffusion XL로 고해상도·고품질 이미지 생성\n• 업스케일링: ESRGAN, RealESRGAN 등 AI 업스케일러 내장\n• 배치 생성: 여러 프롬프트·설정으로 대량 이미지 일괄 생성\n• 모델 관리: Civitai, Hugging Face 모델을 쉽게 추가·관리\n• 히스토리: 생성 이력·설정·시드를 자동 저장하여 재현 가능\n\n【요금제】\n• 완전 무료 (오픈소스, Apache 2.0 라이선스)\n• 하드웨어(NVIDIA GPU 권장) 비용만 사용자 부담",
        "tags": ["Stable Diffusion", "이미지 생성", "로컬", "노드 에디터", "ControlNet", "LoRA", "인페인팅", "오픈소스", "SDXL", "Unified Canvas"],
        "pros": [
            "Unified Canvas로 인페인팅·아웃페인팅·img2img를 하나의 캔버스에서 직관적으로 작업",
            "노드 에디터로 ControlNet, LoRA, 업스케일 등 복잡한 파이프라인을 비주얼로 구성",
            "완전 무료·로컬 실행으로 무제한 이미지 생성 + 프라이버시 보장",
            "Civitai, Hugging Face의 커뮤니티 모델·LoRA를 쉽게 추가하여 스타일 확장",
            "생성 히스토리가 자동 저장되어 시드·프롬프트 재현이 쉬움"
        ],
        "cons": [
            "NVIDIA GPU(최소 6GB VRAM)가 사실상 필수로 하드웨어 요구사항이 높음",
            "초기 설치·환경 설정(Python, CUDA 등)이 기술적으로 어려울 수 있음",
            "DALL-E, Midjourney 등 클라우드 서비스 대비 편의성이 떨어짐",
            "SDXL 모델은 최소 8GB VRAM이 필요하여 저사양 GPU에서 실행 어려움"
        ],
        "usage_tips": [
            "Unified Canvas에서 마스크를 그린 후 인페인팅하면 이미지의 원하는 부분만 수정할 수 있습니다",
            "ControlNet의 Canny 엣지를 사용하면 스케치의 구도를 유지하면서 완성도 높은 이미지를 생성합니다",
            "노드 에디터에서 ControlNet→LoRA→업스케일 파이프라인을 구성하면 프로덕션 품질 워크플로우를 만들 수 있습니다",
            "Civitai에서 인기 LoRA를 다운로드하여 models 폴더에 넣으면 특정 스타일을 쉽게 적용할 수 있습니다",
            "시드를 고정하고 프롬프트만 변경하면 일관된 스타일로 연작 이미지를 만들 수 있습니다",
            "배치 생성으로 프롬프트 변형을 대량 생성한 후 최적의 결과를 선별하면 효율적입니다",
            "ESRGAN 업스케일러를 적용하면 512px 이미지를 2048px 이상으로 고화질 확대할 수 있습니다"
        ],
        "free_quota_detail": "완전 무료 오픈소스 (Apache 2.0 라이선스). 이미지 생성 횟수 무제한. NVIDIA GPU(6GB+ VRAM) 권장. 커뮤니티 모델·LoRA 무료 사용"
    },

    # ── DREAMSTUDIO ──
    "dreamstudio": {
        "description": "Stability AI 공식 이미지 생성 플랫폼. Stable Diffusion 최신 모델, 크레딧 기반 사용, 다양한 스타일·해상도, 가입 시 25 크레딧 무료",
        "long_description": "DreamStudio는 Stability AI가 운영하는 공식 Stable Diffusion 웹 플랫폼으로, 최신 SD 모델을 가장 먼저 사용할 수 있습니다.\n\n【핵심 기능】\n• Text to Image: 텍스트 프롬프트로 고품질 이미지 생성\n• Image to Image: 기존 이미지를 참조하여 변형·스타일 변환\n• 인페인팅: 이미지의 특정 영역을 선택하여 수정·교체\n• 아웃페인팅: 이미지 테두리를 확장하여 더 넓은 장면 생성\n• SDXL 1.0: Stable Diffusion XL로 고해상도·고품질 출력\n• Stable Diffusion 3: 최신 SD3 모델 우선 접근\n• 네거티브 프롬프트: 원치 않는 요소를 제외하는 부정 프롬프트\n• 다양한 해상도: 512x512~1024x1024 이상 다양한 출력 크기\n• 스타일 프리셋: 사진, 애니메, 디지털아트 등 스타일 프리셋\n• API 접근: Stability AI API로 프로그래밍 연동\n\n【요금제】\n• 가입 시 25 크레딧 무료 (약 125장 생성)\n• $10에 1,000 크레딧 추가 구매\n• API: 이미지당 약 $0.002~$0.01",
        "tags": ["이미지 생성", "Stable Diffusion", "SDXL", "SD3", "인페인팅", "아웃페인팅", "크레딧", "API", "Stability AI", "텍스트→이미지"],
        "pros": [
            "Stability AI 공식 플랫폼으로 최신 SD 모델(SDXL, SD3)을 가장 먼저 사용 가능",
            "로컬 설치 없이 웹 브라우저에서 바로 Stable Diffusion 사용 가능",
            "크레딧 단가가 저렴하여 ($10/1,000크레딧) 대량 생성에 경제적",
            "인페인팅·아웃페인팅·img2img 등 편집 기능을 웹에서 제공",
            "API를 통한 프로그래밍 연동으로 자동화·서비스 통합 가능"
        ],
        "cons": [
            "무료 크레딧(25)이 적어 금방 소진됨 (약 125장)",
            "Midjourney, DALL-E 3 대비 프롬프트 이해력·이미지 품질이 떨어질 수 있음",
            "ControlNet, LoRA 등 고급 기능은 로컬 설치(InvokeAI, ComfyUI) 대비 제한적",
            "Stability AI의 재정 상황에 따른 서비스 지속성 불확실성"
        ],
        "usage_tips": [
            "SDXL 1.0 모델을 선택하면 SD 1.5 대비 훨씬 높은 품질의 이미지를 얻을 수 있습니다",
            "네거티브 프롬프트에 'blurry, low quality, deformed'를 추가하면 품질이 크게 향상됩니다",
            "스타일 프리셋(Photographic, Anime 등)을 활용하면 원하는 스타일을 쉽게 적용할 수 있습니다",
            "CFG Scale을 7~12 범위로 설정하면 프롬프트 충실도와 이미지 품질의 균형을 맞출 수 있습니다",
            "Steps를 30~50으로 설정하면 품질이 향상되지만, 크레딧 소모도 증가합니다",
            "API를 활용하면 대량 이미지 생성을 자동화하여 마케팅·디자인 에셋을 효율적으로 제작할 수 있습니다"
        ],
        "free_quota_detail": "가입 시 25 크레딧 무료 (SDXL 기준 약 125장 생성). 추가 구매: $10에 1,000 크레딧. API: 이미지당 약 $0.002~$0.01. 월간 구독 없이 크레딧 충전 방식"
    },

    # ── FREEPIK AI ──
    "freepik-ai": {
        "description": "AI 이미지 생성 + 대형 스톡 라이브러리. 자체 Mystic 모델, Flux 지원, 리터칭·배경 제거, 일 3회 무료 생성 + 스톡 무료 다운로드",
        "long_description": "Freepik AI는 세계 최대 스톡 이미지 플랫폼 Freepik이 제공하는 AI 이미지 생성 및 편집 서비스입니다.\n\n【핵심 기능】\n• AI 이미지 생성: 텍스트 프롬프트로 고품질 이미지 생성\n• Mystic 모델: Freepik 자체 학습 AI 모델로 상업용 이미지 최적화\n• Flux 모델 지원: Flux Pro, Flux Schnell 등 최신 모델 통합\n• AI 리터칭: 생성된 이미지를 AI로 후보정·개선\n• 배경 제거: 원클릭 AI 배경 제거\n• 스타일 전환: 실사, 일러스트, 3D, 애니메 등 다양한 스타일\n• 스톡 라이브러리: 수백만 개의 무료·프리미엄 스톡 이미지·벡터·PSD\n• AI 이미지 확대: 저해상도 이미지를 AI로 고해상도 업스케일\n• 목업 생성: 제품 목업에 디자인을 자동 배치\n• Freepik Designer: 온라인 에디터로 이미지 편집·디자인\n\n【요금제】\n• Free: 일 3회 AI 이미지 생성, 스톡 다운로드 제한적\n• Essential($9/월): 일 100회 생성, 프리미엄 스톡\n• Professional($15/월): 일 200회 생성, 전체 기능\n• Enterprise: 맞춤형 + API",
        "tags": ["이미지 생성", "스톡 이미지", "Mystic", "Flux", "배경 제거", "리터칭", "상업용", "무료", "벡터", "디자인"],
        "pros": [
            "AI 이미지 생성과 수백만 스톡 이미지를 하나의 플랫폼에서 통합 제공",
            "Mystic 모델이 상업용 이미지에 최적화되어 마케팅·디자인 소재로 바로 활용 가능",
            "Flux 모델 지원으로 최신 AI 이미지 생성 기술 접근 가능",
            "무료 플랜에서도 일 3회 AI 생성 + 스톡 다운로드 제공",
            "배경 제거, 리터칭, 업스케일 등 편집 도구가 함께 제공되어 후처리 편리"
        ],
        "cons": [
            "무료 일 3회 AI 생성은 실질적 활용에 부족",
            "전용 AI 모델(Mystic)의 품질이 Midjourney, DALL-E 3 대비 떨어질 수 있음",
            "무료 스톡 이미지에 귀속(attribution) 표시가 필요한 경우 있음",
            "AI 생성 이미지의 스타일이 스톡 이미지 느낌으로 한정될 수 있음"
        ],
        "usage_tips": [
            "AI 이미지 생성 후 Freepik의 스톡 라이브러리에서 보조 소재를 찾아 조합하면 완성도가 높아집니다",
            "Flux 모델을 선택하면 Mystic 대비 더 다양하고 창의적인 이미지를 생성할 수 있습니다",
            "배경 제거 후 스톡 배경 이미지와 합성하면 빠르게 마케팅 소재를 만들 수 있습니다",
            "상업용 프로젝트에는 Essential 이상 플랜을 사용하면 귀속 표시 없이 활용 가능합니다",
            "목업 생성 기능으로 제품 디자인을 실감나는 목업에 바로 적용할 수 있습니다",
            "AI 업스케일 기능으로 저해상도 이미지를 인쇄용 고해상도로 변환할 수 있습니다"
        ],
        "free_quota_detail": "일 3회 AI 이미지 생성 무료, 스톡 이미지 제한적 무료 다운로드 (귀속 표시 필요). Essential $9/월(일 100회), Professional $15/월(일 200회+전체 기능)"
    },

    # ── UIZARD ──
    "uizard": {
        "description": "AI UI/UX 디자인 플랫폼. 텍스트→UI, 스크린샷→디자인, 손그림→와이어프레임, 테마 생성, 프로토타이핑, 무료 티어 제공",
        "long_description": "Uizard는 AI를 활용하여 비디자이너도 전문적인 UI/UX 디자인을 만들 수 있는 웹 기반 디자인 플랫폼입니다.\n\n【핵심 기능】\n• Autodesigner: 텍스트 프롬프트로 앱/웹 UI 화면을 자동 생성\n• Screenshot to Design: 스크린샷을 업로드하면 편집 가능한 디자인으로 변환\n• Hand-drawn to Design: 손으로 그린 스케치를 디지털 와이어프레임으로 변환\n• 테마 생성: 프로젝트 전체에 일관된 색상·폰트·스타일 자동 적용\n• 드래그앤드롭 에디터: 사전 제작된 UI 컴포넌트를 조합하여 디자인\n• 프로토타이핑: 화면 간 링크를 설정하여 인터랙티브 프로토타입 생성\n• 템플릿: 모바일 앱, 웹, 태블릿 등 다양한 디자인 템플릿\n• 팀 협업: 실시간 공동 편집, 코멘트, 버전 관리\n• 디자인 시스템: 컴포넌트 라이브러리로 일관된 디자인 유지\n• 내보내기: PNG, PDF, CSS 코드 내보내기\n\n【요금제】\n• Free: 프로젝트 2개, AI 기능 제한적\n• Pro($19/월): 무제한 프로젝트, AI 기능 확장\n• Business($39/월): 팀 협업, 디자인 시스템\n• Enterprise: 맞춤형",
        "tags": ["UI/UX 디자인", "AI 디자인", "와이어프레임", "프로토타입", "스크린샷→디자인", "텍스트→UI", "노코드", "웹 디자인", "앱 디자인", "협업"],
        "pros": [
            "텍스트 프롬프트만으로 앱·웹 UI 화면을 자동 생성하여 기획 속도 대폭 향상",
            "스크린샷→편집 가능한 디자인 변환으로 참고 앱의 디자인을 빠르게 벤치마킹",
            "손그림 스케치를 디지털 와이어프레임으로 변환하여 아이디어를 즉시 시각화",
            "Figma처럼 복잡하지 않아 비디자이너(기획자, 개발자)도 쉽게 사용",
            "팀 협업 기능으로 디자이너·기획자·개발자가 함께 작업 가능"
        ],
        "cons": [
            "Figma, Sketch 등 전문 도구 대비 디자인 편집 기능이 제한적",
            "AI 생성 UI의 품질이 전문 디자이너 수준에 미치지 못함",
            "무료 플랜 프로젝트 2개 제한으로 지속적 사용에 부족",
            "개발자 핸드오프(코드 변환) 기능이 Figma 생태계 대비 약함"
        ],
        "usage_tips": [
            "Autodesigner에 구체적인 앱 설명(기능, 대상, 스타일)을 입력하면 더 정확한 UI가 생성됩니다",
            "경쟁 앱 스크린샷을 업로드하여 편집 가능한 디자인으로 변환하면 빠르게 벤치마킹할 수 있습니다",
            "손으로 그린 와이어프레임을 촬영하여 업로드하면 디지털 목업으로 즉시 변환됩니다",
            "테마 생성 기능으로 브랜드 색상을 설정하면 전체 화면에 일관된 스타일이 적용됩니다",
            "프로토타이핑으로 화면 간 네비게이션을 설정한 후 링크를 공유하면 클라이언트 리뷰에 유용합니다",
            "기획 초기 단계에서 AI로 빠르게 UI를 생성한 후, 필요시 Figma로 정밀 작업하는 워크플로우를 추천합니다"
        ],
        "free_quota_detail": "Free: 프로젝트 2개, AI 기능 제한적, 기본 컴포넌트. Pro $19/월: 무제한 프로젝트+AI 확장. Business $39/월: 팀 협업+디자인 시스템"
    },

    # ── DIAGRAM ──
    "diagram": {
        "description": "Figma AI 자동화 플러그인. Magician 브랜드로 AI 아이콘·카피·이미지 생성, 디자인 시스템 자동화, Figma 내에서 직접 실행",
        "long_description": "Diagram은 Figma 내에서 AI를 활용한 디자인 자동화를 제공하는 플러그인 기반 도구입니다 (현재 Figma에 인수).\n\n【핵심 기능】\n• Magician 플러그인: Figma 안에서 AI 아이콘, 카피, 이미지 생성\n• AI 아이콘 생성: 텍스트로 설명하면 맞춤 아이콘 자동 생성\n• AI 카피라이팅: UI 텍스트·마이크로카피를 AI가 자동 작성\n• AI 이미지 생성: 디자인 프레임 안에 AI 이미지를 직접 생성\n• 디자인 시스템 자동화: 컴포넌트 네이밍·정리를 AI가 보조\n• 콘텐츠 채우기: 목업에 실감나는 더미 데이터 자동 삽입\n• Figma 네이티브: Figma 에디터를 떠나지 않고 모든 기능 사용\n• 팀 라이선스: 팀원 모두 동일한 AI 기능 공유\n• Genius: 자연어로 Figma 디자인을 수정하는 실험적 기능\n\n【요금제】\n• Figma 인수 후 일부 기능 Figma AI로 통합 중\n• Magician 플러그인: 무료 체험, Pro $5/월/사용자\n• 팀 라이선스: 별도 문의",
        "tags": ["Figma", "플러그인", "AI 디자인", "아이콘 생성", "카피라이팅", "디자인 시스템", "자동화", "UI/UX", "Magician", "디자인 도구"],
        "pros": [
            "Figma 에디터 내에서 벗어나지 않고 AI 기능을 바로 사용할 수 있는 원활한 통합",
            "AI 아이콘 생성으로 커스텀 아이콘을 검색 없이 즉시 만들 수 있음",
            "AI 카피라이팅으로 UI 텍스트·버튼명·에러 메시지를 자동 작성",
            "Figma에 인수되어 향후 Figma AI 기능으로 더 깊은 통합 기대",
            "디자인 시스템 자동화로 컴포넌트 관리 효율화"
        ],
        "cons": [
            "Figma 인수 후 독립 제품 방향성이 불확실",
            "Figma 외 다른 디자인 도구(Sketch, Adobe XD)에서는 사용 불가",
            "AI 생성 결과물이 전문 디자이너 수준에 미치지 못할 수 있음",
            "일부 기능이 Figma AI로 통합되면서 Magician 플러그인의 향후 지원 불확실"
        ],
        "usage_tips": [
            "목업 디자인 시 AI 카피라이팅으로 실감나는 UI 텍스트를 채우면 프레젠테이션 품질이 올라갑니다",
            "커스텀 아이콘이 필요할 때 AI 아이콘 생성을 사용하면 무료 아이콘 사이트를 뒤질 필요가 없습니다",
            "여러 언어의 UI 텍스트를 AI로 생성하면 다국어 디자인 시안을 빠르게 만들 수 있습니다",
            "디자인 시스템 정리 시 AI가 컴포넌트 네이밍 규칙을 제안해줍니다",
            "Genius 기능으로 'Make this button bigger' 같은 자연어 명령을 시도해보세요"
        ],
        "free_quota_detail": "Magician 플러그인 무료 체험 제공, Pro $5/월/사용자. Figma 인수 후 일부 기능이 Figma AI로 통합 중. 팀 라이선스 별도 문의"
    },

    # ── GALILEO AI ──
    "galileo-ai": {
        "description": "텍스트에서 고품질 UI 디자인을 자동 생성하는 AI. 자연어→Figma 호환 UI, 실제 에셋 활용, 디자인 시스템 반영, 웨이트리스트",
        "long_description": "Galileo AI는 자연어 설명만으로 고품질 UI 디자인을 자동 생성하는 차세대 AI 디자인 도구입니다.\n\n【핵심 기능】\n• 텍스트→UI: 자연어로 앱·웹 화면을 설명하면 전문 수준의 UI 디자인 자동 생성\n• 고품질 출력: 실제 사용 가능한 수준의 세련된 UI 디자인 생성\n• Figma 내보내기: 생성된 디자인을 Figma 호환 파일로 내보내기\n• 실제 에셋: 아이콘, 이미지, 일러스트 등 실제 에셋을 자동 배치\n• 디자인 시스템: 컬러, 타이포그래피, 스페이싱 등 디자인 시스템 반영\n• 멀티 화면: 한 번에 여러 화면(온보딩, 홈, 프로필 등)을 연결하여 생성\n• 반응형: 모바일·태블릿·웹 등 다양한 화면 크기 대응\n• 이터레이션: 생성된 디자인을 자연어로 수정·개선 요청\n• 컴포넌트 분리: UI 요소가 레이어별로 분리되어 편집 가능\n\n【요금제】\n• 웨이트리스트·초대 기반 접근 (제한적 공개)\n• 추후 무료 티어 및 유료 플랜 예정",
        "tags": ["AI UI 생성", "텍스트→UI", "Figma", "프로토타입", "자동 디자인", "웹 디자인", "앱 디자인", "디자인 시스템", "노코드 디자인", "차세대"],
        "pros": [
            "자연어만으로 전문 디자이너 수준의 고품질 UI를 생성하는 혁신적 기술",
            "실제 에셋(아이콘, 이미지)을 자동 배치하여 바로 사용 가능한 디자인 출력",
            "Figma 호환으로 생성된 디자인을 기존 워크플로우에 바로 통합",
            "멀티 화면 생성으로 앱 전체 플로우를 한 번에 디자인 가능",
            "디자인 시스템을 반영하여 일관된 브랜드 아이덴티티 유지"
        ],
        "cons": [
            "웨이트리스트·초대 기반으로 즉시 사용이 어려움",
            "생성된 UI의 커스터마이징이 전문 디자인 도구 대비 제한적",
            "복잡한 인터랙션·애니메이션은 아직 지원하지 않음",
            "가격 정책이 확정되지 않아 향후 비용 불확실"
        ],
        "usage_tips": [
            "프롬프트에 앱의 목적, 타겟 사용자, 원하는 스타일을 구체적으로 명시하면 더 정확한 UI가 생성됩니다",
            "생성된 디자인을 Figma로 내보낸 후 세부 조정하면 프로덕션 수준의 결과물을 얻을 수 있습니다",
            "멀티 화면 생성 시 화면 간 관계(온보딩→홈→상세)를 설명하면 일관된 플로우가 만들어집니다",
            "이터레이션 기능으로 '색상을 더 밝게', '카드 레이아웃으로 변경' 등 자연어 수정이 가능합니다",
            "기획 초기에 빠르게 시안을 생성하여 팀·클라이언트와 방향성을 공유하는 용도로 최적입니다"
        ],
        "free_quota_detail": "현재 웨이트리스트·초대 기반 접근. 제한적 무료 사용 가능. 정식 출시 후 무료 티어 및 유료 플랜 예정. 구체적 가격 미확정"
    },
}

# ── Apply updates ──
updated_slugs = []
for tool in data["tools"]:
    slug = tool.get("slug")
    if slug in UPDATES:
        for key, value in UPDATES[slug].items():
            tool[key] = value
        updated_slugs.append(slug)

print(f"Updated {len(updated_slugs)}/{len(UPDATES)} tools: {updated_slugs}")

missing = set(UPDATES.keys()) - set(updated_slugs)
if missing:
    print(f"WARNING: Not found in seed.json: {missing}")

with open(SEED_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("seed.json written successfully.")
