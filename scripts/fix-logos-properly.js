/**
 * 제대로 된 로고 URL 수정
 * 실제 작동하는 URL로만 교체
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '../data/seed.json');
const OUTPUT_PATH = path.join(__dirname, '../data/seed-logos-fixed.json');

// 확실하게 작동하는 로고 URL 매핑 (직접 확인된 것만)
const WORKING_LOGOS = {
  // Dashboard Icons (확인된 것들)
  'chatgpt': 'https://cdn.simpleicons.org/openai',
  'claude': 'https://cdn.simpleicons.org/anthropic',
  'gemini': 'https://cdn.simpleicons.org/googlegemini',
  'github-copilot': 'https://cdn.simpleicons.org/github',
  'midjourney': 'https://cdn.simpleicons.org/midjourney',
  'notion-ai': 'https://cdn.simpleicons.org/notion',
  'figma': 'https://cdn.simpleicons.org/figma',
  'canva-ai': 'https://cdn.simpleicons.org/canva',
  'grammarly': 'https://cdn.simpleicons.org/grammarly',
  'deepl': 'https://cdn.simpleicons.org/deepl',
  'perplexity': 'https://cdn.simpleicons.org/perplexity',
  'huggingchat': 'https://cdn.simpleicons.org/huggingface',
  'replit': 'https://cdn.simpleicons.org/replit',
  'cursor': 'https://cdn.simpleicons.org/cursor',
  'vercel': 'https://cdn.simpleicons.org/vercel',
  'supabase': 'https://cdn.simpleicons.org/supabase',
  'firebase': 'https://cdn.simpleicons.org/firebase',
  'airtable': 'https://cdn.simpleicons.org/airtable',
  'zapier': 'https://cdn.simpleicons.org/zapier',
  'slack': 'https://cdn.simpleicons.org/slack',
  'discord': 'https://cdn.simpleicons.org/discord',
  'zoom': 'https://cdn.simpleicons.org/zoom',
  'linear': 'https://cdn.simpleicons.org/linear',
  'whimsical-ai': 'https://cdn.simpleicons.org/whimsical',
  'coda-ai': 'https://cdn.simpleicons.org/coda',
  'typeform': 'https://cdn.simpleicons.org/typeform',
  'elevenlabs': 'https://cdn.simpleicons.org/elevenlabs',
  'runway-ml': 'https://cdn.simpleicons.org/runway',

  // Google Favicon (신뢰도 높음)
  'wrtn': 'https://www.google.com/s2/favicons?domain=wrtn.ai&sz=128',
  'poe': 'https://www.google.com/s2/favicons?domain=poe.com&sz=128',
  'you-com': 'https://www.google.com/s2/favicons?domain=you.com&sz=128',
  'coze': 'https://www.google.com/s2/favicons?domain=coze.com&sz=128',
  'kimi': 'https://www.google.com/s2/favicons?domain=kimi.moonshot.cn&sz=128',
  'copy-ai': 'https://www.google.com/s2/favicons?domain=copy.ai&sz=128',
  'writesonic': 'https://www.google.com/s2/favicons?domain=writesonic.com&sz=128',
  'quillbot': 'https://www.google.com/s2/favicons?domain=quillbot.com&sz=128',
  'jasper': 'https://www.google.com/s2/favicons?domain=jasper.ai&sz=128',
  'character-ai': 'https://www.google.com/s2/favicons?domain=character.ai&sz=128',
  'fireflies-ai': 'https://www.google.com/s2/favicons?domain=fireflies.ai&sz=128',
  'otter-ai': 'https://www.google.com/s2/favicons?domain=otter.ai&sz=128',
  'tldv': 'https://www.google.com/s2/favicons?domain=tldv.io&sz=128',
  'clova-note': 'https://www.google.com/s2/favicons?domain=clovanote.naver.com&sz=128',
  'rytr': 'https://www.google.com/s2/favicons?domain=rytr.me&sz=128',
  'wordtune': 'https://www.google.com/s2/favicons?domain=wordtune.com&sz=128',
  'sudowrite': 'https://www.google.com/s2/favicons?domain=sudowrite.com&sz=128',
  'typecast': 'https://www.google.com/s2/favicons?domain=typecast.ai&sz=128',
  'leonardo-ai': 'https://www.google.com/s2/favicons?domain=leonardo.ai&sz=128',
  'ideogram': 'https://www.google.com/s2/favicons?domain=ideogram.ai&sz=128',
  'krea-ai': 'https://www.google.com/s2/favicons?domain=krea.ai&sz=128',
  'playground-ai': 'https://www.google.com/s2/favicons?domain=playground.com&sz=128',
  'bing-image-creator': 'https://www.google.com/s2/favicons?domain=bing.com&sz=128',
  'flux': 'https://www.google.com/s2/favicons?domain=flux1.ai&sz=128',
  'remove-bg': 'https://www.google.com/s2/favicons?domain=remove.bg&sz=128',
  'photoroom': 'https://www.google.com/s2/favicons?domain=photoroom.com&sz=128',
  'clipdrop': 'https://www.google.com/s2/favicons?domain=clipdrop.co&sz=128',
  'vrew': 'https://www.google.com/s2/favicons?domain=vrew.voyagerx.com&sz=128',
  'luma-dream-machine': 'https://www.google.com/s2/favicons?domain=lumalabs.ai&sz=128',
  'kling-ai': 'https://www.google.com/s2/favicons?domain=klingai.com&sz=128',
  'synthesia': 'https://www.google.com/s2/favicons?domain=synthesia.io&sz=128',
  'd-id': 'https://www.google.com/s2/favicons?domain=d-id.com&sz=128',
  'descript': 'https://www.google.com/s2/favicons?domain=descript.com&sz=128',
  'opus-clip': 'https://www.google.com/s2/favicons?domain=opus.pro&sz=128',
  'fliki': 'https://www.google.com/s2/favicons?domain=fliki.ai&sz=128',
  'invideo-ai': 'https://www.google.com/s2/favicons?domain=invideo.io&sz=128',
  'topaz-video-ai': 'https://www.google.com/s2/favicons?domain=topazlabs.com&sz=128',
  'tabnine': 'https://www.google.com/s2/favicons?domain=tabnine.com&sz=128',
  'windsurf': 'https://www.google.com/s2/favicons?domain=codeium.com&sz=128',
  'amazon-q-developer': 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128',
  'lovable': 'https://www.google.com/s2/favicons?domain=lovable.dev&sz=128',
  'continue': 'https://www.google.com/s2/favicons?domain=continue.dev&sz=128',
  'pieces': 'https://www.google.com/s2/favicons?domain=pieces.app&sz=128',
  'cody': 'https://www.google.com/s2/favicons?domain=sourcegraph.com&sz=128',
  'blackbox-ai': 'https://www.google.com/s2/favicons?domain=blackbox.ai&sz=128',
  'devin': 'https://www.google.com/s2/favicons?domain=devin.ai&sz=128',
  'v0': 'https://www.google.com/s2/favicons?domain=v0.dev&sz=128',
  'bolt-new': 'https://www.google.com/s2/favicons?domain=bolt.new&sz=128',
  'claude-code': 'https://www.google.com/s2/favicons?domain=claude.ai&sz=128',
  'aiva': 'https://www.google.com/s2/favicons?domain=aiva.ai&sz=128',
  'mubert': 'https://www.google.com/s2/favicons?domain=mubert.com&sz=128',
  'soundraw': 'https://www.google.com/s2/favicons?domain=soundraw.io&sz=128',
  'boomy': 'https://www.google.com/s2/favicons?domain=boomy.com&sz=128',
  'soundful': 'https://www.google.com/s2/favicons?domain=soundful.com&sz=128',
  'beatoven-ai': 'https://www.google.com/s2/favicons?domain=beatoven.ai&sz=128',
  'loudly': 'https://www.google.com/s2/favicons?domain=loudly.com&sz=128',
  'suno-ai': 'https://www.google.com/s2/favicons?domain=suno.ai&sz=128',
  'udio': 'https://www.google.com/s2/favicons?domain=udio.com&sz=128',
  'julius-ai': 'https://www.google.com/s2/favicons?domain=julius.ai&sz=128',
  'google-notebooklm': 'https://www.google.com/s2/favicons?domain=notebooklm.google.com&sz=128',
  'obviously-ai': 'https://www.google.com/s2/favicons?domain=obviously.ai&sz=128',
  'rows-ai': 'https://www.google.com/s2/favicons?domain=rows.com&sz=128',
  'beautiful-ai': 'https://www.google.com/s2/favicons?domain=beautiful.ai&sz=128',
  'slidesai': 'https://www.google.com/s2/favicons?domain=slidesai.io&sz=128',
  'tome': 'https://www.google.com/s2/favicons?domain=tome.app&sz=128',
  'prezi-ai': 'https://www.google.com/s2/favicons?domain=prezi.com&sz=128',
  'gamma': 'https://www.google.com/s2/favicons?domain=gamma.app&sz=128',
  'monkeylearn': 'https://www.google.com/s2/favicons?domain=monkeylearn.com&sz=128',
  'power-bi': 'https://www.google.com/s2/favicons?domain=powerbi.microsoft.com&sz=128',
  'tableau': 'https://www.google.com/s2/favicons?domain=tableau.com&sz=128',
  'hex': 'https://www.google.com/s2/favicons?domain=hex.tech&sz=128',
  'google-translate': 'https://www.google.com/s2/favicons?domain=translate.google.com&sz=128',
  'papago': 'https://www.google.com/s2/favicons?domain=papago.naver.com&sz=128',
  'flitto': 'https://www.google.com/s2/favicons?domain=flitto.com&sz=128',
  'smartcat': 'https://www.google.com/s2/favicons?domain=smartcat.com&sz=128',
  'lingva-translate': 'https://www.google.com/s2/favicons?domain=lingva.ml&sz=128',
  'itranslate': 'https://www.google.com/s2/favicons?domain=itranslate.com&sz=128',
  'loom-ai': 'https://www.google.com/s2/favicons?domain=loom.com&sz=128',
  'miro-ai': 'https://www.google.com/s2/favicons?domain=miro.com&sz=128',
  'tally': 'https://www.google.com/s2/favicons?domain=tally.so&sz=128',
  'scribe': 'https://www.google.com/s2/favicons?domain=scribehow.com&sz=128',
  'reclaim-ai': 'https://www.google.com/s2/favicons?domain=reclaim.ai&sz=128',
  'superhuman': 'https://www.google.com/s2/favicons?domain=superhuman.com&sz=128',
  'mem-ai': 'https://www.google.com/s2/favicons?domain=get.mem.ai&sz=128',
  'napkin-ai': 'https://www.google.com/s2/favicons?domain=napkin.ai&sz=128',
  'krisp': 'https://www.google.com/s2/favicons?domain=krisp.ai&sz=128',
  'make': 'https://www.google.com/s2/favicons?domain=make.com&sz=128',
  'n8n': 'https://www.google.com/s2/favicons?domain=n8n.io&sz=128',

  // 직접 URL (확인된 것)
  'dall-e-3': 'https://openai.com/favicon.ico',
  'stable-diffusion': 'https://stability.ai/favicon.ico',
  'sora': 'https://openai.com/favicon.ico',
  'pika': 'https://pika.art/favicon.ico',
  'capcut': 'https://www.capcut.com/favicon.ico',
  'microsoft-copilot': 'https://copilot.microsoft.com/favicon.ico',
  'grok': 'https://x.com/favicon.ico',
  'huggingface': 'https://huggingface.co/favicon.ico',
  'dwijibgi': 'https://dwijibgi.ai/favicon.ico',
  'adobe-firefly': 'https://firefly.adobe.com/favicon.ico',
};

function main() {
  console.log('🔧 제대로 된 로고 수정\n');

  const data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  let fixed = 0;
  let notFound = [];

  data.tools.forEach(tool => {
    if (WORKING_LOGOS[tool.slug]) {
      const oldUrl = tool.logo_url;
      tool.logo_url = WORKING_LOGOS[tool.slug];
      if (oldUrl !== tool.logo_url) {
        console.log(`✅ ${tool.name} (${tool.slug})`);
        console.log(`   OLD: ${oldUrl.substring(0, 60)}...`);
        console.log(`   NEW: ${tool.logo_url}`);
        fixed++;
      }
    } else if (!tool.logo_url || tool.logo_url.includes('clearbit') || tool.logo_url.includes('duckduckgo')) {
      // 매핑에 없고, Clearbit이나 DuckDuckGo 사용 중인 경우
      notFound.push(tool.slug);
      // Google Favicon으로 폴백
      const domain = extractDomain(tool.url);
      if (domain) {
        tool.logo_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        console.log(`⚠️  ${tool.name} (${tool.slug}) - Google Favicon 폴백`);
        fixed++;
      }
    }
  });

  console.log(`\n📊 결과:`);
  console.log(`   수정됨: ${fixed}`);
  console.log(`   매핑 없음: ${notFound.length}`);

  if (notFound.length > 0) {
    console.log(`\n매핑 없는 도구들:`);
    notFound.forEach(slug => console.log(`   - ${slug}`));
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 저장: ${OUTPUT_PATH}`);
}

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

main();
