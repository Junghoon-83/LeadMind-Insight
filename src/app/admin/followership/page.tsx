'use client';

import ContentEditor from '@/components/admin/ContentEditor';

const fields = [
  { key: 'code', label: '유형 코드', type: 'text' as const, required: true, width: 70 },
  { key: 'name', label: '유형명', type: 'text' as const, required: true, width: 100 },
  { key: 'title', label: '타이틀', type: 'text' as const, required: true, width: 350 },
  { key: 'description', label: '설명', type: 'textarea' as const, required: true, width: 700 },
  { key: 'icon', label: '아이콘', type: 'text' as const, width: 60 },
];

export default function AdminFollowershipPage() {
  return (
    <ContentEditor
      title="팔로워십 유형 관리"
      contentType="followership"
      fields={fields}
    />
  );
}
