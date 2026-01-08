/**
 * 示例脚本：批量删除邮件规则
 * 用途：删除所有以 "Auto-Rule-" 开头的规则
 */

import { deleteRulesByPrefix, listRoutingRules } from './batch-email-manager.js';

async function main() {
  console.log('🗑️  开始批量删除邮件规则\n');
  console.log('='.repeat(60));

  try {
    // 步骤 1：查看现有规则
    console.log('\n📋 步骤 1: 查看现有规则...\n');
    const existingRules = await listRoutingRules();
    console.log(`当前共有 ${existingRules.length} 条规则\n`);

    if (existingRules.length > 0) {
      existingRules.forEach((rule, index) => {
        const prefix = rule.name && rule.name.startsWith('Auto-Rule-') ? '🎯 ' : '   ';
        console.log(`${prefix}${index + 1}. ${rule.name || '未命名'}: ${rule.matchers[0]?.value || 'N/A'}`);
      });
    }

    // 步骤 2：统计要删除的规则
    const autoRules = existingRules.filter(rule => rule.name && rule.name.startsWith('Auto-Rule-'));
    console.log(`\n🎯 找到 ${autoRules.length} 条以 "Auto-Rule-" 开头的规则\n`);

    if (autoRules.length === 0) {
      console.log('⚠️  没有找到需要删除的规则');
      console.log('💡 提示：只会删除名称以 "Auto-Rule-" 开头的规则');
      return;
    }

    // 步骤 3：确认并删除
    console.log('准备删除以下规则:');
    autoRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.name}: ${rule.matchers[0]?.value}`);
    });

    console.log('\n🚀 步骤 3: 开始批量删除...\n');
    const results = await deleteRulesByPrefix('Auto-Rule-');

    // 步骤 4：显示结果
    console.log('\n✨ 步骤 4: 操作结果汇总\n');
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`✅ 成功删除: ${successCount} 条`);
    console.log(`❌ 删除失败: ${failCount} 条`);

    if (failCount > 0) {
      console.log('\n失败的规则:');
      results.filter(r => !r.success).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.ruleId} - ${r.error}`);
      });
    }

    // 步骤 5：查看最终结果
    console.log('\n📋 步骤 5: 查看更新后的规则列表...\n');
    const updatedRules = await listRoutingRules();
    console.log(`现在共有 ${updatedRules.length} 条规则 (-${existingRules.length - updatedRules.length})`);

    if (updatedRules.length > 0) {
      console.log('\n剩余规则:');
      updatedRules.forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.name || '未命名'}: ${rule.matchers[0]?.value || 'N/A'}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 删除完成！');

  } catch (error) {
    console.error('\n❌ 操作失败:', error.message);
    console.error('\n详细错误信息:', error);
  }
}

main();
