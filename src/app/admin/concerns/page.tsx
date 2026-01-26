'use client';

import ContentEditor from '@/components/admin/ContentEditor';

const fields = [
  { key: 'code', label: '코드', type: 'text' as const, required: true, width: 70 },
  { key: 'label', label: '고민 내용', type: 'textarea' as const, required: true, width: 380 },
  { key: 'categories', label: '카테고리', type: 'array' as const, required: true, width: 80 },
  { key: 'groupName', label: '그룹명', type: 'text' as const, required: true, width: 150 },
];

export default function AdminConcernsPage() {
  return (
    <ContentEditor
      title="고민 키워드 관리"
      contentType="concerns"
      fields={fields}
    />
  );
}
