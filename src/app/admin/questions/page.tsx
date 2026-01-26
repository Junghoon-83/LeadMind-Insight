'use client';

import ContentEditor from '@/components/admin/ContentEditor';

const fields = [
  { key: 'code', label: '코드', type: 'text' as const, required: true, width: 70 },
  { key: 'text', label: '질문 내용', type: 'textarea' as const, required: true, width: 600 },
  {
    key: 'category',
    label: '카테고리',
    type: 'select' as const,
    required: true,
    width: 130,
    options: [
      { value: 'growth', label: '성장 (Growth)' },
      { value: 'sharing', label: '공유 (Sharing)' },
      { value: 'interaction', label: '상호작용 (Interaction)' },
    ],
  },
  { key: 'subcategory', label: '하위 카테고리', type: 'text' as const, width: 120 },
];

export default function AdminQuestionsPage() {
  return (
    <ContentEditor
      title="설문문항 관리"
      contentType="questions"
      fields={fields}
    />
  );
}
