
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecordList from './components/RecordList';
import RecordForm from './components/RecordForm';
import { TrainingRecord } from './types';
import { INITIAL_DATA } from './constants';
import { UserPlus, UserMinus } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('training_records_v2');
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      setRecords(INITIAL_DATA);
    }
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('training_records_v2', JSON.stringify(records));
    }
  }, [records]);

  const handleAddRecord = (record: TrainingRecord) => {
    setRecords(prev => [record, ...prev]);
    setShowForm(false);
  };

  const handleUpdateRecord = (updatedRecord: TrainingRecord) => {
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setEditingRecord(null);
  };

  const handleImportRecords = (newRecords: TrainingRecord[]) => {
    setRecords(prev => [...newRecords, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('确定要删除该条进修记录吗？相关附件也将被永久移除。')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    setRecords(prev => prev.filter(r => !ids.includes(r.id)));
  };

  const renderContent = () => {
    if (showForm || editingRecord) {
      return (
        <RecordForm 
          type={(editingRecord?.type || (activeTab === 'incoming' ? 'INCOMING' : 'OUTGOING')) as any} 
          onSave={editingRecord ? handleUpdateRecord : handleAddRecord}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
          initialData={editingRecord || undefined}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard records={records} />;
      case 'incoming':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">来院进修档案</h3>
                <p className="text-sm text-slate-400 font-medium">管理所有从外院来到本机构学习的医护人员</p>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
              >
                <UserPlus size={20} />
                录入新成员
              </button>
            </div>
            <RecordList 
              records={records} 
              type="INCOMING" 
              onDelete={handleDeleteRecord} 
              onBulkDelete={handleBulkDelete}
              onImport={handleImportRecords}
              onEdit={(r) => setEditingRecord(r)}
            />
          </div>
        );
      case 'outgoing':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">外出进修档案</h3>
                <p className="text-sm text-slate-400 font-medium">管理本机构派往国家级、省级等单位进修的员工</p>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-700 transition-all shadow-xl shadow-amber-500/20"
              >
                <UserMinus size={20} />
                录入外派记录
              </button>
            </div>
            <RecordList 
              records={records} 
              type="OUTGOING" 
              onDelete={handleDeleteRecord} 
              onBulkDelete={handleBulkDelete}
              onImport={handleImportRecords}
              onEdit={(r) => setEditingRecord(r)}
            />
          </div>
        );
      default:
        return <Dashboard records={records} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      setShowForm(false);
      setEditingRecord(null);
    }}>
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
