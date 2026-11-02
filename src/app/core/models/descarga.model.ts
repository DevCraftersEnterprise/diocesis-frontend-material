export interface Descarga {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
  publishedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
}

/** Tamaño legible: 1536 -> "1.5 KB", 2097152 -> "2 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[unitIndex]}`;
}
