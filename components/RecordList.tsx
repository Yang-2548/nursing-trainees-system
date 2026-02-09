
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, Trash2, Download, MapPin, FileUp, FileText, ChevronDown, CheckCircle, Edit3, XCircle } from 'lucide-react';
import { TrainingRecord, TrainingType, FilterState, IncomingRecord, OutgoingRecord } from '../types';
import { DEPARTMENTS, HOSPITAL_LEVELS, INSTITUTION_LEVELS } from '../constants';
import { generateId, calculateDurationMonths, formatExcelDate, findValueByKeywords, parseDateRange } from '../utils';

interface RecordListProps {
  records: TrainingRecord[];
  type: TrainingType;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onImport: (newRecords: TrainingRecord[]) => void;
  onEdit: (record: TrainingRecord) => void;
}

const RecordList: React.FC<RecordListProps> = ({ records, type, onDelete, onBulkDelete, onImport, onEdit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<FilterState>({
    type,
    year: '',
    department: '',
    specialty: '',
    searchTerm: '',
    hospital: '',
    hospitalLevel: '',
    province: '',
    city: '',
    institution: '',
    level: '',
    startDate: '',
    endDate: ''
  });

  // 当记录改变时，同步更新选中列表
  useEffect(() => {
    setSelectedIds(prev => {
      const next = new Set<string>();
      prev.forEach(id => {
        if (records.some(r => r.id === id)) next.add(id);
      });
      return next;
    });
  }, [records]);

  // 修复后的过滤逻辑
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // 首先筛选大类型
      if (r.type !== type) return false;
      
      // 快速搜索框：姓名、科室、专业、医院/单位
      if (filters.searchTerm) {
        const s = filters.searchTerm.toLowerCase();
        const incoming = r.type === 'INCOMING' ? r as IncomingRecord : null;
        const outgoing = r.type === 'OUTGOING' ? r as OutgoingRecord : null;
        
        const match = r.name.toLowerCase().includes(s) || 
                      r.specialty.toLowerCase().includes(s) ||
                      r.department.toLowerCase().includes(s) ||
                      (incoming && incoming.hospital.toLowerCase().includes(s)) ||
                      (outgoing && outgoing.institution.toLowerCase().includes(s));
        
        if (!match) return false;
      }

      // 高级筛选：年份 (匹配开始日期的年份)
      if (filters.year && !r.startDate.startsWith(filters.year)) return false;
      
      // 科室精准匹配
      if (filters.department && r.department !== filters.department) return false;
      
      // 专业模糊匹配
      if (filters.specialty && !r.specialty.toLowerCase().includes(filters.specialty.toLowerCase())) return false;
      
      // 针对不同类型的特定字段筛选
      if (type === 'INCOMING') {
        const ir = r as IncomingRecord;
        if (filters.hospital && !ir.hospital.toLowerCase().includes(filters.hospital.toLowerCase())) return false;
        if (filters.hospitalLevel && ir.hospitalLevel !== filters.hospitalLevel) return false;
        if (filters.province && !ir.province.toLowerCase().includes(filters.province.toLowerCase())) return false;
        if (filters.city && !ir.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      } else {
        const or = r as OutgoingRecord;
        if (filters.institution && !or.institution.toLowerCase().includes(filters.institution.toLowerCase())) return false;
        if (filters.level && or.level !== filters.level) return false;
      }

      return true;
    });
  }, [records, filters, type]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredRecords.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDeleteAction = () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;
    if (window.confirm(`确认删除选中的 ${idsToDelete.length} 条记录？此操作将永久移除数据。`)) {
      onBulkDelete(idsToDelete);
      setSelectedIds(new Set());
    }
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert("当前列表没有可导出的数据");
      return;
    }
    const wsData = filteredRecords.map(r => {
      const base = {
        '姓名': r.name,
        '科室': r.department,
        '专业': r.specialty,
        '开始日期': r.startDate,
        '结束日期': r.endDate,
        '时长(月)': r.durationMonths,
      };

      if (r.type === 'INCOMING') {
        const ir = r as IncomingRecord;
        return {
          ...base,
          '来源医院': ir.hospital,
          '医院级别': ir.hospitalLevel,
          '所在地': `${ir.province} ${ir.city}`,
        };
      } else {
        const or = r as OutgoingRecord;
        return {
          ...base,
          '进修单位': or.institution,
          '单位级别': or.level,
          '结业证状态': or.certificate ? '已上传' : '未上传'
        };
      }
    });

    const ws = (window as any).XLSX.utils.json_to_sheet(wsData);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "数据导出");
    (window as any).XLSX.writeFile(wb, `${type === 'INCOMING' ? '来院' : '外出'}进修生_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result;
        const workbook = (window as any).XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = (window as any).XLSX.utils.sheet_to_json(sheet);

        if (rawData.length === 0) {
          alert("Excel 内容为空，请检查文件格式。");
          return;
        }

        const mappedRecords: TrainingRecord[] = rawData.map((row: any) => {
          const name = findValueByKeywords(row, ['姓名', '名', '人员', 'Name']);
          const department = findValueByKeywords(row, ['科室', '部门', 'Dept']);
          const specialty = findValueByKeywords(row, ['专业', '方向', 'Specialty']);
          
          // 获取日期列，并尝试解析范围
          const timeColRaw = findValueByKeywords(row, ['时间', '日期', '周期', 'Period', 'Date']);
          const range = parseDateRange(timeColRaw);
          
          let startDate = range.start;
          let endDate = range.end;

          // 如果没有解析到范围，尝试查找独立的开始/结束列
          if (!startDate) startDate = formatExcelDate(findValueByKeywords(row, ['开始', '起', 'Start']));
          if (!endDate) endDate = formatExcelDate(findValueByKeywords(row, ['结束', '止', 'End']));

          const base = {
            id: generateId(),
            name: String(name || '未命名'),
            department: String(department || '未填科室'),
            specialty: String(specialty || '未填专业'),
            startDate,
            endDate,
            durationMonths: calculateDurationMonths(startDate, endDate),
            type,
            createdAt: new Date().toISOString()
          };

          if (type === 'INCOMING') {
            return {
              ...base,
              type: 'INCOMING',
              hospital: String(findValueByKeywords(row, ['医院', '来源', 'Hospital']) || ''),
              hospitalLevel: String(findValueByKeywords(row, ['医院级别', '等级', 'Level']) || '三级甲等'),
              province: String(findValueByKeywords(row, ['省', '所在地', 'Province']) || ''),
              city: String(findValueByKeywords(row, ['市', 'City']) || '')
            } as IncomingRecord;
          } else {
            return {
              ...base,
              type: 'OUTGOING',
              institution: String(findValueByKeywords(row, ['单位', '进修机构', 'Institution']) || ''),
              level: String(findValueByKeywords(row, ['级别', '层级', 'Level']) || '国家级')
            } as OutgoingRecord;
          }
        });

        onImport(mappedRecords);
        alert(`导入成功！已成功解析 ${mappedRecords.length} 条数据。`);
      } catch (err) {
        console.error("Import error:", err);
        alert("导入失败，请确保文件是标准 Excel 格式。");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const resetFilters = () => {
    setFilters({
      type, year: '', department: '', specialty: '', searchTerm: '',
      hospital: '', hospitalLevel: '', province: '', city: '',
      institution: '', level: '', startDate: '', endDate: ''
    });
  };

  const isAllSelected = filteredRecords.length > 0 && selectedIds.size === filteredRecords.length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="搜索姓名、科室、专业、来源..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>
          
          <button 
            onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${
              showAdvanceFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <Filter size={18} />
            精确筛选
            <ChevronDown size={14} className={`transition-transform ${showAdvanceFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          {selectedIds.size > 0 && (
            <button 
              onClick={handleBulkDeleteAction}
              className="px-4 py-3 rounded-xl bg-rose-600 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-200 animate-in zoom-in-95"
            >
              <Trash2 size={18} />
              批量删除 ({selectedIds.size})
            </button>
          )}

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold flex items-center gap-2 transition-all"
          >
            <FileUp size={18} />
            导入Excel
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />

          <button 
            onClick={handleExport}
            className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold flex items-center gap-2 hover:bg-slate-900 transition-all shadow-md"
          >
            <Download size={18} />
            数据导出
          </button>
        </div>

        {showAdvanceFilters && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">进修年份</label>
                <input 
                  type="number" 
                  placeholder="如: 2024"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  value={filters.year}
                  onChange={e => setFilters(p => ({...p, year: e.target.value}))}
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">所在科室</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                >
                  <option value="">全部科室</option>
                  {DEPARTMENTS.sort().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
             </div>
             {type === 'INCOMING' ? (
               <>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">来源省份</label>
                    <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white" placeholder="输入省份名称" value={filters.province} onChange={e => setFilters(p => ({...p, province: e.target.value}))} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">医院级别</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white" value={filters.hospitalLevel} onChange={e => setFilters(p => ({...p, hospitalLevel: e.target.value}))}>
                      <option value="">全部级别</option>
                      {HOSPITAL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                 </div>
               </>
             ) : (
               <>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">进修级别</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white" value={filters.level} onChange={e => setFilters(p => ({...p, level: e.target.value}))}>
                      <option value="">全部级别</option>
                      {INSTITUTION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">单位搜索</label>
                    <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white" placeholder="进修机构名称" value={filters.institution} onChange={e => setFilters(p => ({...p, institution: e.target.value}))} />
                 </div>
               </>
             )}
             <div className="lg:col-span-4 flex justify-end">
               <button onClick={resetFilters} className="text-sm font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1">
                 <XCircle size={14} />
                 重置所有筛选条件
               </button>
             </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="px-6 py-5 w-10">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-5">进修生基本信息</th>
                <th className="px-6 py-5">{type === 'INCOMING' ? '所属医疗机构' : '目的地单位'}</th>
                <th className="px-6 py-5">进修科室/专业</th>
                <th className="px-6 py-5">周期时长</th>
                {type === 'OUTGOING' && <th className="px-6 py-5">状态/证件</th>}
                <th className="px-6 py-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className={`group hover:bg-slate-50/50 transition-all ${selectedIds.has(record.id) ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.has(record.id)}
                        onChange={() => handleSelectOne(record.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100 shadow-sm">
                          {record.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">{record.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">#{record.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {record.type === 'INCOMING' ? (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700 leading-tight">{(record as IncomingRecord).hospital}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{(record as IncomingRecord).hospitalLevel}</span>
                            <span className="flex items-center gap-0.5 text-[10px] text-slate-400"><MapPin size={10}/>{(record as IncomingRecord).province}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700 leading-tight">{(record as OutgoingRecord).institution}</p>
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-black tracking-wider border border-amber-100">{(record as OutgoingRecord).level}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{record.specialty}</p>
                      <p className="text-xs text-slate-400 font-medium">{record.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-600">{record.startDate} 至 {record.endDate}</p>
                      <div className="inline-flex items-center px-2 py-0.5 mt-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-black border border-indigo-100">
                        {record.durationMonths} 个月
                      </div>
                    </td>
                    {type === 'OUTGOING' && (
                      <td className="px-6 py-4">
                        {(record as OutgoingRecord).certificate ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[11px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 w-fit">
                            <CheckCircle size={14} />
                            已结业
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] px-2.5 py-1 border border-dashed border-slate-200 rounded-full w-fit">
                            在修中
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(record)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="修改"
                        >
                          <Edit3 size={18} />
                        </button>
                        {(record as any).certificate && (
                          <button 
                            onClick={() => window.open((record as any).certificate.data)}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="证书"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => onDelete(record.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300 max-w-xs mx-auto">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                        <FileText size={32} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-400">暂无匹配数据</p>
                        <p className="text-sm text-slate-300 mt-1">请尝试调整搜索关键词或重置筛选条件</p>
                      </div>
                      <button onClick={resetFilters} className="mt-2 px-6 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-white hover:border-blue-400 hover:text-blue-500 transition-all">
                        查看全部记录
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecordList;
