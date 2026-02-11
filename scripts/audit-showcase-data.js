/**
 * Showcase Data Quality Audit
 *
 * 모든 도구의 쇼케이스 데이터 품질 검사
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '../data/seed.json');

function main() {
  console.log('🔍 Showcase Data Quality Audit\n');

  const data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  const tools = data.tools || [];
  const toolShowcases = data.tool_showcases || [];
  const categoryShowcases = data.category_showcases || [];

  // 카테고리 쇼케이스 ID 맵
  const csMap = new Map(categoryShowcases.map(cs => [cs.id, cs]));

  console.log('📊 Overall Stats:');
  console.log(`   Total tools: ${tools.length}`);
  console.log(`   Tools with tool_showcases: ${new Set(toolShowcases.map(ts => ts.tool_slug)).size}`);
  console.log(`   Tools with sample_output: ${tools.filter(t => t.sample_output).length}`);
  console.log('');

  // 각 도구별 상태 분석
  const issues = [];

  tools.forEach(tool => {
    const showcases = toolShowcases.filter(ts => ts.tool_slug === tool.slug);

    // 도구별 상태
    const status = {
      slug: tool.slug,
      name: tool.name,
      hasShowcase: showcases.length > 0,
      hasSampleOutput: !!tool.sample_output,
      showcaseCount: showcases.length,
      issues: [],
    };

    if (showcases.length > 0) {
      showcases.forEach(sc => {
        const categoryShowcase = csMap.get(sc.showcase_id);

        // 쇼케이스 데이터 검증
        if (!categoryShowcase) {
          status.issues.push(`Invalid showcase_id: ${sc.showcase_id}`);
        } else {
          // prompt 확인
          if (!categoryShowcase.prompt_ko || categoryShowcase.prompt_ko.trim().length === 0) {
            status.issues.push('Empty prompt_ko');
          }
        }

        // result 확인
        if (!sc.result_text && !sc.result_image_url) {
          status.issues.push('No result (text or image)');
        }

        // result_text 품질 확인
        if (sc.result_text) {
          if (sc.result_text.trim().length === 0) {
            status.issues.push('Empty result_text');
          }
          if (sc.result_text.length > 2000) {
            status.issues.push(`Very long result_text (${sc.result_text.length} chars)`);
          }
          // 특수 문자/인코딩 문제 체크
          if (sc.result_text.includes('\ufffd') || sc.result_text.includes('�')) {
            status.issues.push('Invalid characters in result_text');
          }
        }

        // description 확인
        if (!sc.result_description || sc.result_description.trim().length === 0) {
          status.issues.push('Empty result_description');
        }
      });
    }

    // sample_output 폴백 검증
    if (!showcases.length && !tool.sample_output) {
      status.issues.push('No showcase data AND no sample_output (nothing to display)');
    }

    if (status.issues.length > 0) {
      issues.push(status);
    }
  });

  // 이슈 리포트
  if (issues.length > 0) {
    console.log('⚠️  Issues Found:\n');

    const byIssue = {};
    issues.forEach(item => {
      item.issues.forEach(issue => {
        if (!byIssue[issue]) byIssue[issue] = [];
        byIssue[issue].push(item);
      });
    });

    Object.entries(byIssue).forEach(([issue, items]) => {
      console.log(`❌ ${issue} (${items.length} tools)`);
      items.slice(0, 5).forEach(item => {
        console.log(`     - ${item.name} (${item.slug})`);
      });
      if (items.length > 5) {
        console.log(`     ... and ${items.length - 5} more`);
      }
      console.log('');
    });

    console.log(`\n📋 Total tools with issues: ${issues.length}/${tools.length}`);
  } else {
    console.log('✅ No issues found! All showcase data is valid.\n');
  }

  // 통계: 표시 방식별 분류
  console.log('\n📈 Display Method Distribution:');
  const withBothShowcaseAndSample = tools.filter(t => {
    const hasShowcase = toolShowcases.some(ts => ts.tool_slug === t.slug);
    return hasShowcase && t.sample_output;
  });
  const onlyShowcase = tools.filter(t => {
    const hasShowcase = toolShowcases.some(ts => ts.tool_slug === t.slug);
    return hasShowcase && !t.sample_output;
  });
  const onlySample = tools.filter(t => {
    const hasShowcase = toolShowcases.some(ts => ts.tool_slug === t.slug);
    return !hasShowcase && t.sample_output;
  });
  const nothing = tools.filter(t => {
    const hasShowcase = toolShowcases.some(ts => ts.tool_slug === t.slug);
    return !hasShowcase && !t.sample_output;
  });

  console.log(`   Both showcase & sample_output: ${withBothShowcaseAndSample.length}`);
  console.log(`   Only showcase: ${onlyShowcase.length}`);
  console.log(`   Only sample_output: ${onlySample.length}`);
  console.log(`   Nothing to display: ${nothing.length}`);

  if (nothing.length > 0) {
    console.log('\n   Tools with nothing to display:');
    nothing.forEach(t => console.log(`     - ${t.name} (${t.slug})`));
  }

  // 상세 리포트 저장
  const report = {
    summary: {
      totalTools: tools.length,
      toolsWithShowcase: new Set(toolShowcases.map(ts => ts.tool_slug)).size,
      toolsWithSampleOutput: tools.filter(t => t.sample_output).length,
      toolsWithIssues: issues.length,
    },
    issues,
    distribution: {
      both: withBothShowcaseAndSample.map(t => t.slug),
      onlyShowcase: onlyShowcase.map(t => t.slug),
      onlySample: onlySample.map(t => t.slug),
      nothing: nothing.map(t => t.slug),
    },
  };

  const reportPath = path.join(__dirname, '../data/showcase-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
}

main();
