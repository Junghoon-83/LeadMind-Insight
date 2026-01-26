'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, RefreshCw, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAdminStore } from '@/store/useAdminStore';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'array' | 'boolean';
  options?: { value: string; label: string }[];
  required?: boolean;
  readonly?: boolean;
  hideInTable?: boolean;
  width?: number; // Default width in pixels
}

interface ContentEditorProps {
  title: string;
  contentType: string;
  fields: Field[];
  idField?: string;
}

export default function ContentEditor({
  title,
  contentType,
  fields,
}: ContentEditorProps) {
  const { getAuthHeader } = useAdminStore();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Record<string, unknown>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isStaticData, setIsStaticData] = useState(false);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLTableElement>(null);

  // Get display columns
  const displayColumns = fields
    .filter((f) => !f.hideInTable && (f.type === 'text' || f.type === 'select' || f.type === 'number' || f.type === 'textarea' || f.type === 'array'))
    .slice(0, 5);

  // Get default width for a field
  const getDefaultWidth = (field: Field): number => {
    if (field.width) return field.width;
    switch (field.type) {
      case 'number': return 80;
      case 'array': return 200;
      case 'textarea': return 250;
      case 'select': return 150;
      default: return 150;
    }
  };

  // Initialize column widths
  useEffect(() => {
    const storageKey = `admin-columns-${contentType}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setColumnWidths(JSON.parse(saved));
      } catch {
        // Initialize with defaults
        const defaults: Record<string, number> = {};
        displayColumns.forEach(col => {
          defaults[col.key] = getDefaultWidth(col);
        });
        setColumnWidths(defaults);
      }
    } else {
      const defaults: Record<string, number> = {};
      displayColumns.forEach(col => {
        defaults[col.key] = getDefaultWidth(col);
      });
      setColumnWidths(defaults);
    }
  }, [contentType, fields]);

  // Get column width
  const getColWidth = (key: string): number => {
    return columnWidths[key] || 150;
  };

  // Resize handling
  const resizeState = useRef<{
    isResizing: boolean;
    columnKey: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    const startWidth = getColWidth(columnKey);
    resizeState.current = {
      isResizing: true,
      columnKey,
      startX: e.clientX,
      startWidth,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizeState.current?.isResizing) return;

    const { columnKey, startX, startWidth } = resizeState.current;
    const diff = e.clientX - startX;
    const newWidth = Math.max(50, Math.min(1200, startWidth + diff));

    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: newWidth,
    }));
  };

  const handleMouseUp = () => {
    if (resizeState.current) {
      // Save to localStorage
      const storageKey = `admin-columns-${contentType}`;
      localStorage.setItem(storageKey, JSON.stringify(columnWidths));
    }

    resizeState.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Reset column widths
  const resetColumnWidths = () => {
    const defaults: Record<string, number> = {};
    displayColumns.forEach(col => {
      defaults[col.key] = getDefaultWidth(col);
    });
    setColumnWidths(defaults);
    const storageKey = `admin-columns-${contentType}`;
    localStorage.removeItem(storageKey);
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/content?type=${contentType}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      const result = await response.json();
      setData(result.data || []);
      setIsStaticData(result.isStatic === true);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contentType]);

  // Start editing
  const handleEdit = (item: Record<string, unknown>) => {
    setEditingId(item.id as number);
    setEditingData({ ...item });
    setIsAdding(false);
  };

  // Start adding new item
  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    const newItem: Record<string, unknown> = {};
    fields.forEach((field) => {
      if (field.type === 'array') {
        newItem[field.key] = [];
      } else if (field.type === 'boolean') {
        newItem[field.key] = true;
      } else if (field.type === 'number') {
        newItem[field.key] = 0;
      } else {
        newItem[field.key] = '';
      }
    });
    setEditingData(newItem);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditingData({});
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const method = isAdding ? 'POST' : 'PUT';
      const body = isAdding
        ? { type: contentType, data: editingData }
        : { type: contentType, id: editingId, data: editingData };

      const response = await fetch('/api/admin/content', {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchData();
        handleCancel();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '저장 실패');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류 발생');
    } finally {
      setSaving(false);
    }
  };

  // Delete item
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(
        `/api/admin/content?type=${contentType}&id=${id}`,
        {
          method: 'DELETE',
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      if (response.ok) {
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '삭제 실패');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류 발생');
    }
  };

  // Update field value
  const updateField = (key: string, value: unknown) => {
    setEditingData((prev) => ({ ...prev, [key]: value }));
  };

  // Render field input
  const renderFieldInput = (field: Field) => {
    const value = editingData[field.key];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent min-h-[120px] text-sm"
            placeholder={`${field.label}을(를) 입력하세요`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={(value as number) || 0}
            onChange={(e) => updateField(field.key, parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
          />
        );

      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm bg-white"
          >
            <option value="">선택하세요</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'array':
        const arrayValue = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {arrayValue.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newArray = [...arrayValue];
                    newArray[index] = e.target.value;
                    updateField(field.key, newArray);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                  placeholder={`항목 ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newArray = arrayValue.filter((_, i) => i !== index);
                    updateField(field.key, newArray);
                  }}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateField(field.key, [...arrayValue, ''])}
              className="text-sm text-[var(--color-primary)] hover:underline font-medium"
            >
              + 항목 추가
            </button>
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={(value as boolean) || false}
                onChange={(e) => updateField(field.key, e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  value ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    value ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </div>
            </div>
            <span className="text-sm text-gray-700">
              {value ? '활성화' : '비활성화'}
            </span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
            placeholder={`${field.label}을(를) 입력하세요`}
          />
        );
    }
  };

  // Format cell value for display
  const formatCellValue = (item: Record<string, unknown>, field: Field): string => {
    const value = item[field.key];
    if (value === null || value === undefined) return '-';
    if (field.type === 'boolean') return value ? 'Y' : 'N';
    if (field.type === 'array') {
      const arr = value as string[];
      if (!arr || arr.length === 0) return '-';
      // CSS truncate가 처리하도록 전체 텍스트 반환, 항목 수만 표시
      const firstItem = arr[0] || '';
      return arr.length > 1 ? `${firstItem} 외 ${arr.length - 1}개` : firstItem;
    }
    if (field.type === 'select') {
      const option = field.options?.find((o) => o.value === value);
      return option?.label || String(value);
    }
    return String(value);
  };

  // Calculate total columns width (without spacer)
  const columnsWidth = displayColumns.reduce((sum, col) => sum + getColWidth(col.key), 0);
  const actionColumnWidth = 100;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {data.length}개 항목
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetColumnWidths} className="text-xs px-3">
            <RotateCcw className="w-3 h-3 mr-1" />
            너비 초기화
          </Button>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button onClick={handleAdd} disabled={isStaticData}>
            <Plus className="w-4 h-4 mr-2" />
            새 항목 추가
          </Button>
        </div>
      </div>

      {/* Static Data Warning */}
      {isStaticData && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">읽기 전용 모드</p>
            <p className="text-sm text-amber-700 mt-1">
              Database가 설정되지 않아 static 데이터를 표시하고 있습니다.
              수정하려면 MySQL을 실행하고 Prisma 마이그레이션을 실행해주세요.
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAdding || editingId !== null) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {isAdding ? '새 항목 추가' : '항목 수정'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-2 gap-6">
                {fields
                  .filter((f) => !f.readonly)
                  .map((field) => (
                  <div
                    key={field.key}
                    className={
                      field.type === 'textarea' || field.type === 'array'
                        ? 'col-span-2'
                        : ''
                    }
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">데이터가 없습니다</p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 항목 추가
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              ref={tableRef}
              className="w-full"
              style={{ tableLayout: 'fixed', minWidth: columnsWidth + actionColumnWidth }}
            >
              <colgroup>
                {displayColumns.map((col) => (
                  <col key={col.key} style={{ width: getColWidth(col.key) }} />
                ))}
                {/* Spacer column - absorbs remaining space */}
                <col style={{ width: 'auto' }} />
                {/* Action column - fixed width */}
                <col style={{ width: actionColumnWidth }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b">
                  {displayColumns.map((col) => (
                    <th
                      key={col.key}
                      className="relative px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider select-none"
                    >
                      <div className="whitespace-nowrap pr-2">{col.label}</div>
                      {/* Resize handle */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, col.key)}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-gray-300 hover:bg-violet-500 transition-colors"
                      />
                    </th>
                  ))}
                  {/* Spacer header */}
                  <th className="bg-gray-50"></th>
                  <th
                    className="sticky right-0 px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]"
                  >
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item, index) => (
                  <tr
                    key={item.id as string || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {displayColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-3 text-sm text-gray-900"
                      >
                        <div className="truncate" title={String(item[col.key] || '')}>
                          {formatCellValue(item, col)}
                        </div>
                      </td>
                    ))}
                    {/* Spacer cell */}
                    <td className="bg-white"></td>
                    <td
                      className="sticky right-0 px-3 py-3 bg-white shadow-[-2px_0_4px_rgba(0,0,0,0.1)]"
                    >
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          disabled={isStaticData}
                          className={`p-2 rounded-lg transition-colors ${
                            isStaticData
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-violet-100)]'
                          }`}
                          title={isStaticData ? '읽기 전용' : '수정'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id as number)}
                          disabled={isStaticData}
                          className={`p-2 rounded-lg transition-colors ${
                            isStaticData
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title={isStaticData ? '읽기 전용' : '삭제'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
