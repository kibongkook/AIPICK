/**
 * Logo.dev API가 작동하지 않으므로
 * 모든 로고를 Google Favicon API로 교체
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '../data/seed.json');

// 도메인 추출 함수
function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function main() {
  console.log('🔧 모든 로고를 Google Favicon API로 교체\n');

  const data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  let updated = 0;

  data.tools.forEach(tool => {
    const domain = extractDomain(tool.url);
    if (domain) {
      const oldUrl = tool.logo_url;
      tool.logo_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

      if (oldUrl !== tool.logo_url) {
        console.log(`✅ ${tool.name}`);
        console.log(`   ${domain}`);
        updated++;
      }
    } else {
      console.warn(`⚠️  도메인 추출 실패: ${tool.name} (${tool.url})`);
    }
  });

  console.log(`\n📊 결과: ${updated}개 로고 업데이트`);

  fs.writeFileSync(SEED_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 저장 완료: ${SEED_PATH}`);
}

main();
