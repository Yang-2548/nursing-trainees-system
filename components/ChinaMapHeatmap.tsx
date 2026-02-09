
import React, { useMemo } from 'react';
import { TrainingRecord, IncomingRecord } from '../types';

interface ChinaMapHeatmapProps {
  records: TrainingRecord[];
}

// 简化版中国地图省份位置（矩形热力图布局，适合作为热力图展示）
const PROVINCES = [
  { id: 'HLJ', name: '黑龙江', x: 8, y: 0 },
  { id: 'JL', name: '吉林', x: 8, y: 1 },
  { id: 'LN', name: '辽宁', x: 8, y: 2 },
  { id: 'NM', name: '内蒙古', x: 5, y: 1 },
  { id: 'BJ', name: '北京', x: 6, y: 2 },
  { id: 'TJ', name: '天津', x: 7, y: 2 },
  { id: 'HEB', name: '河北', x: 6, y: 3 },
  { id: 'SX', name: '山西', x: 5, y: 3 },
  { id: 'SD', name: '山东', x: 7, y: 3 },
  { id: 'HEN', name: '河南', x: 6, y: 4 },
  { id: 'AH', name: '安徽', x: 7, y: 4 },
  { id: 'JS', name: '江苏', x: 8, y: 4 },
  { id: 'SH', name: '上海', x: 9, y: 4 },
  { id: 'HUB', name: '湖北', x: 6, y: 5 },
  { id: 'JX', name: '江西', x: 7, y: 5 },
  { id: 'ZJ', name: '浙江', x: 8, y: 5 },
  { id: 'HUN', name: '湖南', x: 6, y: 6 },
  { id: 'FJ', name: '福建', x: 7, y: 6 },
  { id: 'GD', name: '广东', x: 6, y: 7 },
  { id: 'HK', name: '香港', x: 7, y: 7 },
  { id: 'MO', name: '澳门', x: 5, y: 7 },
  { id: 'GX', name: '广西', x: 5, y: 6 },
  { id: 'HAN', name: '海南', x: 6, y: 8 },
  { id: 'CQ', name: '重庆', x: 4, y: 5 },
  { id: 'SC', name: '四川', x: 3, y: 5 },
  { id: 'GZ', name: '贵州', x: 4, y: 6 },
  { id: 'YN', name: '云南', x: 3, y: 6 },
  { id: 'XZ', name: '西藏', x: 1, y: 5 },
  { id: 'SNX', name: '陕西', x: 5, y: 4 },
  { id: 'GS', name: '甘肃', x: 4, y: 4 },
  { id: 'QH', name: '青海', x: 3, y: 4 },
  { id: 'NX', name: '宁夏', x: 4, y: 3 },
  { id: 'XJ', name: '新疆', x: 1, y: 2 },
  { id: 'TW', name: '台湾', x: 8, y: 7 }
];

const ChinaMapHeatmap: React.FC<ChinaMapHeatmapProps> = ({ records }) => {
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.filter(r => r.type === 'INCOMING').forEach(r => {
      const p = (r as IncomingRecord).province || '';
      // 简单模糊匹配省份名称
      const found = PROVINCES.find(prov => p.includes(prov.name) || prov.name.includes(p));
      if (found) {
        counts[found.id] = (counts[found.id] || 0) + 1;
      }
    });
    return counts;
  }, [records]);

  // Fix: Object.values can return unknown[] in some TS configurations.
  // Explicitly cast to number[] to satisfy the Math.max signature.
  const maxCount = Math.max(...(Object.values(provinceCounts) as number[]), 1);

  const getColor = (count: number) => {
    if (!count) return '#f8fafc'; // bg-slate-50
    const intensity = Math.min(count / maxCount, 1);
    // 从浅蓝到深蓝
    if (intensity < 0.2) return '#dbeafe'; // blue-100
    if (intensity < 0.4) return '#93c5fd'; // blue-300
    if (intensity < 0.6) return '#3b82f6'; // blue-500
    if (intensity < 0.8) return '#1d4ed8'; // blue-700
    return '#1e3a8a'; // blue-900
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative grid grid-cols-10 gap-1 w-full max-w-[500px] aspect-[10/9]">
        {PROVINCES.map(prov => {
          const count = provinceCounts[prov.id] || 0;
          return (
            <div 
              key={prov.id}
              className="absolute rounded-md border border-white/50 shadow-sm flex items-center justify-center text-[10px] font-bold group transition-all hover:scale-110 hover:z-10 cursor-default"
              style={{
                left: `${prov.x * 10}%`,
                top: `${prov.y * 11}%`,
                width: '9%',
                height: '10%',
                backgroundColor: getColor(count),
                color: count > (maxCount / 2) ? '#fff' : '#64748b'
              }}
            >
              <span className="hidden sm:inline">{prov.name.substring(0, 2)}</span>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none transition-opacity">
                {prov.name}: {count}人
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#f8fafc] border border-slate-200"></div>
          <span>0人</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#dbeafe]"></div>
          <span>少</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#1e3a8a]"></div>
          <span>多</span>
        </div>
      </div>
    </div>
  );
};

export default ChinaMapHeatmap;
