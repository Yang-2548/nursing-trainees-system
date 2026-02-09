
export const calculateDurationMonths = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  
  let totalMonths = years * 12 + months;
  
  // 如果结束日期的天数小于开始日期的天数，则最后一个月不计入
  if (end.getDate() < start.getDate()) {
    if (totalMonths > 0) totalMonths--;
  }

  return Math.max(0, totalMonths);
};

// 处理包含范围的日期字符串，如 "2023-01-01 至 2023-06-01"
export const parseDateRange = (val: any): { start: string; end: string } => {
  const result = { start: '', end: '' };
  if (!val) return result;

  const str = String(val);
  // 匹配常见的各种分隔符
  const separators = ['至', '到', '~', ' - ', '-'];
  let parts: string[] = [];

  for (const sep of separators) {
    if (str.includes(sep)) {
      parts = str.split(sep).map(s => s.trim());
      if (parts.length >= 2) break;
    }
  }

  if (parts.length >= 2) {
    result.start = formatExcelDate(parts[0]);
    result.end = formatExcelDate(parts[1]);
  } else {
    result.start = formatExcelDate(val);
  }

  return result;
};

// 处理 Excel 日期格式 (数字转字符串)
export const formatExcelDate = (val: any): string => {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    // Excel 1900 日期系统偏移
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // 尝试直接解析字符串，移除可能干扰的特殊字符
  const cleanVal = String(val).replace(/[年月日]/g, '-').replace(/-+$/, '');
  try {
    const d = new Date(cleanVal);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch (e) {}
  
  return cleanVal;
};

// 模糊匹配表头字段
export const findValueByKeywords = (row: any, keywords: string[]): any => {
  const keys = Object.keys(row);
  for (const key of keys) {
    const cleanKey = key.trim();
    if (keywords.some(k => cleanKey.includes(k))) {
      return row[key];
    }
  }
  return undefined;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
