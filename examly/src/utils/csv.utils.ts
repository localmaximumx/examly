// Utility for formatting clean, dynamic CSV filenames and standardized downloads

export const formatCSVFilename = (...parts: (string | undefined | null)[]): string => {
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cleanParts = parts
    .filter(Boolean)
    .map(p =>
      String(p)
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
    )
    .filter(Boolean);

  return `${cleanParts.join('_')}_${dateStr}.csv`;
};

export const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

export const downloadCSV = (content: string, filename: string): void => {
  // Ensure UTF-8 BOM so Excel and spreadsheet viewers recognize characters correctly
  const fullContent = content.startsWith('\uFEFF') ? content : '\uFEFF' + content;
  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
