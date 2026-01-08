/**
 * Cloudflare Email Routing 批量管理工具
 * 功能：批量添加/删除邮件路由规则
 *
 * GitHub: https://github.com/ban-shao/cloudflare-email-batch-manager
 * License: MIT
 */

const CONFIG = {
  // Cloudflare API 配置 - 使用 Global API Key
  ACCOUNT_ID: 'YOUR_ACCOUNT_ID',
  ZONE_ID: 'YOUR_ZONE_ID',
  API_EMAIL: 'YOUR_CLOUDFLARE_EMAIL',
  API_KEY: 'YOUR_GLOBAL_API_KEY',

  // 域名和目标邮箱
  DOMAIN: 'your-domain.com',
  DESTINATION_EMAIL: 'your-destination@gmail.com',

  // API 端点
  API_BASE: 'https://api.cloudflare.com/client/v4'
};

/**
 * 发送 API 请求
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${CONFIG.API_BASE}${endpoint}`;

  const options = {
    method,
    headers: {
      'X-Auth-Email': CONFIG.API_EMAIL,
      'X-Auth-Key': CONFIG.API_KEY,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
  }

  return data.result;
}

/**
 * 获取所有现有的路由规则
 */
async function listRoutingRules() {
  console.log('📋 获取现有路由规则...');
  const rules = await apiRequest(`/zones/${CONFIG.ZONE_ID}/email/routing/rules`);
  console.log(`✅ 找到 ${rules.length} 条规则`);
  return rules;
}

/**
 * 批量添加邮件路由规则
 * @param {Array<string>} emailPrefixes - 邮箱前缀列表，如 ['cursor001', 'cursor002']
 */
async function batchAddRules(emailPrefixes) {
  console.log(`\n🚀 开始批量添加 ${emailPrefixes.length} 条规则...\n`);

  const results = [];

  for (let i = 0; i < emailPrefixes.length; i++) {
    const prefix = emailPrefixes[i];
    const email = `${prefix}@${CONFIG.DOMAIN}`;

    try {
      const rule = await apiRequest(
        `/zones/${CONFIG.ZONE_ID}/email/routing/rules`,
        'POST',
        {
          matchers: [
            {
              type: 'literal',
              field: 'to',
              value: email
            }
          ],
          actions: [
            {
              type: 'forward',
              value: [CONFIG.DESTINATION_EMAIL]
            }
          ],
          enabled: true,
          name: `Auto-Rule-${prefix}`
        }
      );

      console.log(`✅ [${i + 1}/${emailPrefixes.length}] 添加成功: ${email}`);
      results.push({ success: true, email, ruleId: rule.id });

    } catch (error) {
      console.error(`❌ [${i + 1}/${emailPrefixes.length}] 添加失败: ${email} - ${error.message}`);
      results.push({ success: false, email, error: error.message });
    }

    // 避免 API 限流，每次请求间隔 200ms
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n✨ 批量添加完成！成功: ${results.filter(r => r.success).length}/${emailPrefixes.length}\n`);
  return results;
}

/**
 * 批量删除邮件路由规则
 * @param {Array<string>} ruleIds - 规则 ID 列表
 */
async function batchDeleteRules(ruleIds) {
  console.log(`\n🗑️  开始批量删除 ${ruleIds.length} 条规则...\n`);

  const results = [];

  for (let i = 0; i < ruleIds.length; i++) {
    const ruleId = ruleIds[i];

    try {
      await apiRequest(
        `/zones/${CONFIG.ZONE_ID}/email/routing/rules/${ruleId}`,
        'DELETE'
      );

      console.log(`✅ [${i + 1}/${ruleIds.length}] 删除成功: ${ruleId}`);
      results.push({ success: true, ruleId });

    } catch (error) {
      console.error(`❌ [${i + 1}/${ruleIds.length}] 删除失败: ${ruleId} - ${error.message}`);
      results.push({ success: false, ruleId, error: error.message });
    }

    // 避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n✨ 批量删除完成！成功: ${results.filter(r => r.success).length}/${ruleIds.length}\n`);
  return results;
}

/**
 * 按名称前缀删除规则（方便删除自动创建的规则）
 * @param {string} namePrefix - 规则名称前缀，如 'Auto-Rule-'
 */
async function deleteRulesByPrefix(namePrefix) {
  console.log(`\n🔍 查找名称前缀为 "${namePrefix}" 的规则...\n`);

  const allRules = await listRoutingRules();
  const matchedRules = allRules.filter(rule => rule.name && rule.name.startsWith(namePrefix));

  console.log(`📌 找到 ${matchedRules.length} 条匹配的规则\n`);

  if (matchedRules.length === 0) {
    console.log('⚠️  没有找到匹配的规则');
    return [];
  }

  const ruleIds = matchedRules.map(rule => rule.id);
  return await batchDeleteRules(ruleIds);
}

/**
 * 生成邮箱前缀列表
 * @param {string} prefix - 前缀，如 'cursor'
 * @param {number} count - 数量
 * @param {number} startIndex - 起始编号
 */
function generatePrefixes(prefix, count, startIndex = 1) {
  const prefixes = [];
  const paddingLength = String(startIndex + count - 1).length;

  for (let i = 0; i < count; i++) {
    const number = String(startIndex + i).padStart(paddingLength, '0');
    prefixes.push(`${prefix}${number}`);
  }

  return prefixes;
}

// ==================== 导出模块 ====================

export {
  batchAddRules,
  batchDeleteRules,
  deleteRulesByPrefix,
  listRoutingRules,
  generatePrefixes
};
