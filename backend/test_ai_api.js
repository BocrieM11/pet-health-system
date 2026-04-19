const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'pet-health-system-secret-key-2026';

// 生成token（模拟登录）
const token = jwt.sign(
  { id: 1, username: '111', email: 'bochuanmi@gmail.com' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

// 测试AI分析API
async function testAIAnalysis() {
  try {
    console.log('🧪 测试AI分析API...\n');
    
    const response = await axios.post(
      'http://localhost:3001/api/ai/analyze/3',
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ AI分析成功！');
    console.log('\n分析结果摘要:');
    console.log('- 健康评分:', response.data.analysis.healthScore);
    console.log('- 总结:', response.data.analysis.summary.substring(0, 100) + '...');
    console.log('- 预警数量:', response.data.analysis.warnings?.length || 0);
    console.log('- 建议数量:', response.data.analysis.recommendations?.length || 0);
    
  } catch (error) {
    console.log('❌ AI分析失败:');
    console.log('状态码:', error.response?.status);
    console.log('错误信息:', error.response?.data?.error || error.message);
  }
}

testAIAnalysis();
