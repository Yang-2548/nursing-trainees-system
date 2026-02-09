
import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Calendar, MapPin, Building2, User, GraduationCap, Upload, FileCheck } from 'lucide-react';
import { TrainingType, TrainingRecord, IncomingRecord, OutgoingRecord } from '../types';
import { HOSPITAL_LEVELS, INSTITUTION_LEVELS, DEPARTMENTS } from '../constants';
import { calculateDurationMonths, generateId } from '../utils';

interface RecordFormProps {
  type: TrainingType;
  onSave: (record: TrainingRecord) => void;
  onCancel: () => void;
  initialData?: TrainingRecord;
}

const RecordForm: React.FC<RecordFormProps> = ({ type, onSave, onCancel, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<TrainingRecord>>({
    id: generateId(),
    type,
    name: '',
    specialty: '',
    startDate: '',
    endDate: '',
    durationMonths: 0,
    department: '',
    createdAt: new Date().toISOString(),
    ...(type === 'INCOMING' 
      ? { hospital: '', hospitalLevel: '三级甲等', province: '', city: '' } 
      : { institution: '', level: '国家级', certificate: undefined }
    )
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化编辑数据
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const months = calculateDurationMonths(formData.startDate, formData.endDate);
      setFormData(prev => ({ ...prev, durationMonths: months }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          certificate: {
            name: file.name,
            type: file.type,
            data: event.target?.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = '请输入姓名';
    if (!formData.specialty) newErrors.specialty = '请输入专业';
    if (!formData.startDate) newErrors.startDate = '请选择开始时间';
    if (!formData.endDate) newErrors.endDate = '请选择结束时间';
    if (!formData.department) newErrors.department = '请选择科室';
    
    if (type === 'INCOMING') {
      if (!(formData as any).hospital) newErrors.hospital = '请输入医院名称';
      if (!(formData as any).province) newErrors.province = '请输入所在省份';
    } else {
      if (!(formData as any).institution) newErrors.institution = '请输入进修单位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData as TrainingRecord);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-4xl mx-auto mb-10">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {isEdit ? '修改进修档案' : (type === 'INCOMING' ? '录入来院进修信息' : '录入外出进修信息')}
          </h3>
          {isEdit && <p className="text-xs text-slate-400 mt-1">档案ID: {formData.id}</p>}
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">姓名</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="进修人员姓名" />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">科室</label>
            <input list="dept-list" name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="输入或搜索科室" />
            <datalist id="dept-list">{DEPARTMENTS.map(d => <option key={d} value={d} />)}</datalist>
            {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">专业方向</label>
            <input name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="进修的具体专业" />
          </div>

          {type === 'INCOMING' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">来源医院</label>
                <input name="hospital" value={(formData as any).hospital} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="原所属医院名称" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">所在省</label>
                  <input name="province" value={(formData as any).province} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="省份" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">所在市</label>
                  <input name="city" value={(formData as any).city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="城市" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">医院级别</label>
                <select name="hospitalLevel" value={(formData as any).hospitalLevel} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                  {HOSPITAL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">进修目标单位</label>
                <input name="institution" value={(formData as any).institution} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="前往进修的机构名称" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">进修级别</label>
                <select name="level" value={(formData as any).level} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                  {INSTITUTION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">开始时间</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">结束时间</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center">
          <span className="text-sm font-bold text-blue-700">系统自动计算进修时长：</span>
          <div className="text-xl font-black text-blue-600">
            {formData.durationMonths} <span className="text-sm">个月</span>
          </div>
        </div>

        {type === 'OUTGOING' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">进修结业证上传 (支持图片/PDF)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                (formData as any).certificate ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
              {(formData as any).certificate ? (
                <>
                  <FileCheck size={32} />
                  <span className="font-bold">{(formData as any).certificate.name}</span>
                  <span className="text-xs opacity-60 text-emerald-600 underline">点击更换文件</span>
                </>
              ) : (
                <>
                  <Upload size={32} />
                  <span className="font-medium">点击或拖拽文件进行上传</span>
                  <span className="text-xs opacity-60">支持 .jpg, .png, .pdf 格式</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">取消</button>
          <button type="submit" className="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save size={18} />
            {isEdit ? '保存修改' : '保存记录'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordForm;
