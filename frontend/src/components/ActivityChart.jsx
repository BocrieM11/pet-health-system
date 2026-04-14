import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function ActivityChart({ data, period }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        暂无{period === 'day' ? '今日' : period === 'week' ? '本周' : '本月'}活动数据
      </div>
    );
  }

  // 获取所有记录类型
  const allTypes = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'date') {
        allTypes.add(key);
      }
    });
  });

  const colors = ['#667eea', '#51cf66', '#ffa94d', '#ff6b6b', '#845ef7'];
  const typesArray = Array.from(allTypes);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            label={{ value: '日期', position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis
            label={{ value: '记录数量', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          {typesArray.map((type, index) => (
            <Bar
              key={type}
              dataKey={type}
              name={type}
              fill={colors[index % colors.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ActivityChart;
