
import { TrainingRecord } from './types';
import { generateId } from './utils';

export const HOSPITAL_LEVELS = ['三级甲等', '三级乙等', '二级甲等', '二级乙等', '其他'];
export const INSTITUTION_LEVELS = ['国家级', '省级', '市级', '校级', '其他'];

// 综合更新后的科室列表
export const DEPARTMENTS = [
  '急诊病房', '全科医学科', '急诊科', '重症医学科', '消化内科', '神经内科', '血液内科', '消化内镜中心',
  '呼吸与危重症医学科', '风湿免疫科', '老年医学综合科', '心血管内科', '肾内科', '血液净化中心', '康复医学科',
  '内分泌科', '肿瘤内科', '产房', '儿科', '新生儿科', '妇科', '产科', '手术室', '消毒供应中心',
  '神经外科肿瘤病区', '神经外科血管病区', '神经外科重症监护室', '功能神经科', '泌尿外科', '胸外科',
  '胃肠外科', '肝胆胰外科', '甲乳外科', '骨关节骨肿瘤科', '脊柱外科', '创伤骨科', '运动医学科及足踝外科手外科',
  '耳鼻咽喉科', '眼口腔颌面外科', '烧伤整形科', '介入科', '肛肠外科', '血管外科', '门诊部', '口腔门诊',
  '高压氧科', '特诊科', '体检科', '医学影像科', '超声科', '梅林社康', '中医科', '分院门诊', '中西医结合科', '针灸推拿科'
];

export const INITIAL_DATA: TrainingRecord[] = [
  {
    id: generateId(),
    type: 'INCOMING',
    name: '张三',
    hospital: 'XX省人民医院',
    hospitalLevel: '三级甲等',
    province: '广东省',
    city: '广州市',
    department: '心血管内科',
    specialty: '介入放射',
    startDate: '2023-03-01',
    endDate: '2023-09-01',
    durationMonths: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: generateId(),
    type: 'OUTGOING',
    name: '李四',
    department: '胃肠外科',
    specialty: '微创外科',
    institution: '北京协和医院',
    level: '国家级',
    startDate: '2023-01-10',
    endDate: '2024-01-10',
    durationMonths: 12,
    createdAt: new Date().toISOString()
  }
];
