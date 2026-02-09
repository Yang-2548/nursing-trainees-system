
import React from 'react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  GraduationCap, 
  TrendingUp,
  MapPin,
  FileText
} from 'lucide-react';
import Analytics from './Analytics';
import ChinaMapHeatmap from './ChinaMapHeatmap';
import { TrainingRecord } from '../types';

interface DashboardProps {
  records: TrainingRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const incoming = records.filter(r => r.type === 'INCOMING');
  const outgoing = records.filter(r => r.type === 'OUTGOING');
  const certCount = records.filter(r => r.type === 'OUTGOING' && (r as any).certificate).length;

  const stats = [
    { 
      label: '总进修人数', 
      value: records.length, 
      change: '+12%', 
      trend: 'up', 
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600'
    },
    { 
      label: '来院进修', 
      value: incoming.length, 
      change: '+5.4%', 
      trend: 'up', 
      icon: ArrowUpRight,
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      label: '外出进修', 
      value: outgoing.length, 
      change: '-2%', 
      trend: 'down', 
      icon: ArrowDownRight,
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      label: '已传证书', 
      value: certCount, 
      change: `${certCount}/${outgoing.length}`, 
      trend: 'up', 
      icon: FileText,
      color: 'bg-blue-50 text-blue-600'
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className={`${stat.color} p-2 md:p-3 rounded-xl`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] md:text-sm font-medium">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="bg-slate-100/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <TrendingUp className="text-blue-600 w-5 h-5" />
          <h2 className="text-lg md:text-xl font-bold text-slate-800">统计分析看板</h2>
        </div>
        <Analytics records={records} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm md:text-base">最近动态</h3>
            <button className="text-blue-600 text-xs font-bold hover:underline">查看所有</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="px-5 py-3">人员</th>
                  <th className="px-5 py-3">类型</th>
                  <th className="px-5 py-3">科室/专业</th>
                  <th className="px-5 py-3">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.slice(0, 5).map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-bold text-sm text-slate-700">{record.name}</td>
                    <td className="px-5 py-3">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                         record.type === 'INCOMING' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {record.type === 'INCOMING' ? '来院' : '外出'}
                       </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {record.department}
                    </td>
                    <td className="px-5 py-3">
                      {record.type === 'OUTGOING' && (record as any).certificate ? (
                        <span className="text-emerald-500 text-[10px] font-black">已结业</span>
                      ) : (
                        <span className="text-blue-500 text-[10px] font-black">在修中</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heatmap Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm flex flex-col">
          <h4 className="font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base">
            <MapPin size={16} className="text-blue-500" />
            来院生分布
          </h4>
          <div className="flex-1 min-h-[280px]">
            <ChinaMapHeatmap records={records} />
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center italic font-medium leading-relaxed px-4">
            * 基于全国各省份来院人数生成的实时热力图
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
