/**
 * 示例脚本：批量添加邮件规则
 * 用途：添加 5 个测试邮箱规则，验证功能是否正常
 */

import { batchAddRules, generatePrefixes, listRoutingRules } from './batch-email-manager.js';

async function main() {
  console.log('🎯 开始测试批量添加邮件规则\n');
  console.log('='.repeat(60));

  try {
    // 步骤 1：查看现有规则
    console.log('\n📋 步骤 1: 查看现有规则...\n');
    const existingRules = await listRoutingRules();
    console.log(`当前已有 ${existingRules.length} 条规则`);

    if (existingRules.length > 0) {
      existingRules.forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.name || '未命名'}: ${rule.matchers[0]?.value || 'N/A'}`);
      });
    }

    // 步骤 2：生成测试邮箱前缀
    console.log('\n📧 步骤 2: 生成 5 个测试邮箱前缀...\n');
    const testPrefixes = generatePrefixes('test', 5, 1);
    console.log('生成的前缀:', testPrefixes.join(', '));

    // 步骤 3：批量添加规则
    console.log('\n🚀 步骤 3: 批量添加规则...\n');
    const results = await batchAddRules(testPrefixes);

    // 步骤 4：显示结果
    console.log('\n✨ 步骤 4: 操作结果汇总\n');
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`✅ 成功: ${successCount} 条`);
    console.log(`❌ 失败: ${failCount} 条`);

    if (successCount > 0) {
      console.log('\n成功添加的规则:');
      results.filter(r => r.success).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.email} (ID: ${r.ruleId})`);
      });
    }

    if (failCount > 0) {
      console.log('\n失败的规则:');
      results.filter(r => !r.success).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.email} - ${r.error}`);
      });
    }

    // 步骤 5：再次查看所有规则
    console.log('\n📋 步骤 5: 查看更新后的规则列表...\n');
    const updatedRules = await listRoutingRules();
    console.log(`现在共有 ${updatedRules.length} 条规则 (+${updatedRules.length - existingRules.length})`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 测试完成！\n');
    console.log('💡 提示：运行 node test-delete-rules.js 可清理测试数据');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n详细错误信息:', error);
  }
}

main();
