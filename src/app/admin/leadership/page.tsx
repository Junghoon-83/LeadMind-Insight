'use client';

import ContentEditor from '@/components/admin/ContentEditor';

const fields = [
  { key: 'code', label: '유형 코드', type: 'text' as const, required: true, width: 70 },
  { key: 'name', label: '유형명', type: 'text' as const, required: true, width: 140 },
  { key: 'title', label: '타이틀', type: 'text' as const, required: true, width: 350 },
  { key: 'description', label: '설명', type: 'textarea' as const, required: true, width: 400 },
  { key: 'strengths', label: '강점', type: 'array' as const, width: 280 },
  { key: 'challenges', label: '성장 포인트', type: 'array' as const, width: 280 },
  { key: 'image', label: '이미지 URL', type: 'text' as const, width: 150 },
];

export default function AdminLeadershipPage() {
  return (
    <ContentEditor
      title="리더십 유형 관리"
      contentType="leadership"
      fields={fields}
    />
  );
}
