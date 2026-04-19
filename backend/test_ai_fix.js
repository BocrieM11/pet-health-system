// 测试AI分析权限修复
const jwt = require('jsonwebtoken');

// 模拟登录生成的token
const JWT_SECRET = 'pet-health-system-secret-key-2026';

const token = jwt.sign(
  { id: 1, username: '111', email: 'bochuanmi@gmail.com' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('生成的测试Token:');
console.log(token);
console.log('\n解析Token内容:');
const decoded = jwt.verify(token, JWT_SECRET);
console.log(decoded);
console.log('\n用户ID字段名:', decoded.id ? 'id ✓' : 'userId ✗');
