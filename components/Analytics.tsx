
import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { TrainingRecord } from '../types';

interface AnalyticsProps {
  records: TrainingRecord[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
const CATEGORY_COLORS = {
  INCOMING: '#10b981', // 绿色代表来院 (吸纳)
  OUTGOING: '#3b82f6', // 蓝色代表外出 (扩展)
};

const Analytics: React.FC<AnalyticsProps> = ({ records }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOMING' | 'OUTGOING'>('ALL');

  // 1. 年度趋势对比
  const yearTrendData = useMemo(() => {
    const map: Record<string, { year: string; incoming: number; outgoing: number; total: number }> = {};
    records.forEach(r => {
      const year = r.startDate.split('-')[0];
      if (!year || isNaN(parseInt(year))) return;
      if (!map[year]) map[year] = { year, incoming: 0, outgoing: 0, total: 0 };
      if (r.type === 'INCOMING') map[year].incoming++;
      else map[year].outgoing++;
      map[year].total++;
    });
    return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
  }, [records]);

  // 2. 科室分布 (根据类型区分)
  const deptData = useMemo(() => {
    const map: Record<string, { name: string; incoming: number; outgoing: number; total: number }> = {};
    records.forEach(r => {
      if (!map[r.department]) map[r.department] = { name: r.department, incoming: 0, outgoing: 0, total: 0 };
      if (r.type === 'INCOMING') map[r.department].incoming++;
      else map[r.department].outgoing++;
      map[r.department].total++;
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [records]);

  // 3. 统计摘要
  const incomingCount = records.filter(r => r.type === 'INCOMING').length;
  const outgoingCount = records.filter(r => r.type === 'OUTGOING').length;

  return (
    <div className="space-y-8 pb-10">
      {/* 类型切换控制器 */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          综合对比
        </button>
        <button 
          onClick={() => setActiveTab('INCOMING')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'INCOMING' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          来院进修分析
        </button>
        <button 
          onClick={() => setActiveTab('OUTGOING')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'OUTGOING' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          外出进修分析
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 趋势图 - 区分类型 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">年度进修人次趋势</h3>
            <p className="text-xs text-slate-400 mt-1 font-bold">纵向对比来院与外出的规模变化</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearTrendData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CATEGORY_COLORS.INCOMING} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CATEGORY_COLORS.INCOMING} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CATEGORY_COLORS.OUTGOING} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CATEGORY_COLORS.OUTGOING} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px' }} />
                {(activeTab === 'ALL' || activeTab === 'INCOMING') && (
                  <Area name="来院进修 (次)" type="monotone" dataKey="incoming" stroke={CATEGORY_COLORS.INCOMING} strokeWidth={4} fillOpacity={1} fill="url(#colorIn)" />
                )}
                {(activeTab === 'ALL' || activeTab === 'OUTGOING') && (
                  <Area name="外出进修 (次)" type="monotone" dataKey="outgoing" stroke={CATEGORY_COLORS.OUTGOING} strokeWidth={4} fillOpacity={1} fill="url(#colorOut)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 核心指标与分类构成 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">核心统计概况</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
               <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">来院总计</p>
                  <p className="text-3xl font-black text-emerald-700">{incomingCount}<span className="text-sm ml-1">人</span></p>
               </div>
               <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">外出总计</p>
                  <p className="text-3xl font-black text-blue-700">{outgoingCount}<span className="text-sm ml-1">人</span></p>
               </div>
            </div>
          </div>
          <div className="flex-1 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '来院进修', value: incomingCount },
                    { name: '外出进修', value: outgoingCount }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={CATEGORY_COLORS.INCOMING} />
                  <Cell fill={CATEGORY_COLORS.OUTGOING} />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', fontWeight: 'bold' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 热门科室排行 - 堆叠对比 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">各科室进修业务分布 Top 10</h3>
            <p className="text-xs text-slate-400 mt-1 font-bold">对比各科室在不同进修类型上的活跃程度</p>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 12, fontWeight: 800}} 
                />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '15px' }} />
                <Legend iconType="rect" />
                <Bar 
                  dataKey="incoming" 
                  stackId="a" 
                  fill={CATEGORY_COLORS.INCOMING} 
                  radius={[0, 0, 0, 0]} 
                  barSize={24}
                  name="来院人次"
                />
                <Bar 
                  dataKey="outgoing" 
                  stackId="a" 
                  fill={CATEGORY_COLORS.OUTGOING} 
                  radius={[0, 8, 8, 0]} 
                  barSize={24}
                  name="外出人次"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
