
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
      label: '已上传证书 (外出)', 
      value: certCount, 
      change: `${certCount}/${outgoing.length}`, 
      trend: 'up', 
      icon: FileText,
      color: 'bg-blue-50 text-blue-600'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Section - Integrated */}
      <div className="bg-slate-100/50 p-6 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">实时统计分析大屏</h2>
        </div>
        <Analytics records={records} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">最近动态</h3>
            <button className="text-blue-600 text-sm font-bold hover:underline">查看所有</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <th className="px-6 py-4">人员</th>
                  <th className="px-6 py-4">类型</th>
                  <th className="px-6 py-4">科室/专业</th>
                  <th className="px-6 py-4">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.slice(0, 6).map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-700">{record.name}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                         record.type === 'INCOMING' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {record.type === 'INCOMING' ? '来院' : '外出'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.department} · {record.specialty}
                    </td>
                    <td className="px-6 py-4">
                      {record.type === 'OUTGOING' && (record as any).certificate ? (
                        <span className="text-emerald-500 text-xs font-bold">证件已齐</span>
                      ) : record.type === 'OUTGOING' ? (
                        <span className="text-slate-300 text-xs italic">证件待补</span>
                      ) : (
                        <span className="text-emerald-500 text-xs font-bold">进行中</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <MapPin size={18} className="text-blue-500" />
            来院生全国热力图
          </h4>
          <div className="flex-1 min-h-[300px]">
            <ChinaMapHeatmap records={records} />
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center italic">
            * 颜色越深代表该地区进修生人数越多
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
