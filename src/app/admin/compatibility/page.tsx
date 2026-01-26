'use client';

import ContentEditor from '@/components/admin/ContentEditor';

const fields = [
  {
    key: 'leaderType',
    label: '리더십 유형',
    type: 'select' as const,
    required: true,
    width: 200,
    options: [
      { value: 'L01', label: 'L01 - 공동 비전형 리더' },
      { value: 'L02', label: 'L02 - 성장 파트너형 리더' },
      { value: 'L03', label: 'L03 - 운영 중심형 리더' },
      { value: 'L04', label: 'L04 - 화합 중심형 리더' },
      { value: 'L05', label: 'L05 - 통찰력 있는 멘토 리더' },
      { value: 'L06', label: 'L06 - 안식처형 리더' },
      { value: 'L07', label: 'L07 - 맞춤 촉진형 리더' },
      { value: 'L08', label: 'L08 - 리더십 전환기 리더' },
    ],
  },
  {
    key: 'followerType',
    label: '팔로워십 유형',
    type: 'select' as const,
    required: true,
    width: 200,
    options: [
      { value: 'F01', label: 'F01 - Driver (추진형)' },
      { value: 'F02', label: 'F02 - Thinker (탐구형)' },
      { value: 'F03', label: 'F03 - Supporter (연결형)' },
      { value: 'F04', label: 'F04 - Doer (실행형)' },
      { value: 'F05', label: 'F05 - Follower (대기형)' },
    ],
  },
  { key: 'strengths', label: '강점', type: 'array' as const, required: true, width: 400 },
  { key: 'cautions', label: '주의점', type: 'array' as const, required: true, width: 400 },
  { key: 'tips', label: '코칭 팁', type: 'array' as const, width: 350 },
];

export default function AdminCompatibilityPage() {
  return (
    <ContentEditor
      title="궁합 관리"
      contentType="compatibility"
      fields={fields}
    />
  );
}
