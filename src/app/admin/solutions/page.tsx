'use client';

import { useState, useEffect } from 'react';
import ContentEditor from '@/components/admin/ContentEditor';

const fields = [
  { key: 'code', label: '코드', type: 'text' as const, required: true, width: 70 },
  { key: 'combination', label: '조합', type: 'text' as const, required: true, width: 80 },
  { key: 'title', label: '제목', type: 'textarea' as const, required: true, width: 380 },
  { key: 'coreIssue', label: '핵심 이슈', type: 'textarea' as const, required: true, width: 350 },
  { key: 'fieldVoices', label: '현장의 목소리', type: 'array' as const, width: 280 },
  { key: 'diagnosis', label: '진단', type: 'textarea' as const, required: true, width: 350 },
];

export default function AdminSolutionsPage() {
  return (
    <div>
      <ContentEditor
        title="솔루션 관리"
        contentType="solutions"
        fields={fields}
      />

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>참고:</strong> 솔루션의 액션(방법, 기대효과, 리더십 팁)은 별도로 관리됩니다.
          솔루션을 먼저 추가한 후, 아래에서 액션을 관리하세요.
        </p>
      </div>

      <div className="mt-8">
        <ActionsEditor />
      </div>
    </div>
  );
}

// Actions Editor Component with dynamic solution options
function ActionsEditor() {
  const [solutionOptions, setSolutionOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSolutions() {
      try {
        const res = await fetch('/api/admin/content?type=solutions');
        const data = await res.json();
        const options = (data.data || []).map((s: { id: string; code: string; combination: string }) => ({
          value: s.id,
          label: `${s.code} (${s.combination})`,
        }));
        setSolutionOptions(options);
      } catch (error) {
        console.error('Failed to fetch solutions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSolutions();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        솔루션 목록을 불러오는 중...
      </div>
    );
  }

  return (
    <ContentEditor
      title="솔루션 액션 관리"
      contentType="actions"
      fields={[
        { key: 'solutionCode', label: '솔루션 코드', type: 'text' as const, readonly: true, width: 70 },
        { key: 'combination', label: '조합', type: 'text' as const, readonly: true, width: 70 },
        { key: 'sortOrder', label: '액션 번호', type: 'number' as const, required: true, width: 70 },
        { key: 'solutionId', label: '솔루션 선택', type: 'select' as const, options: solutionOptions, required: true, hideInTable: true },
        { key: 'title', label: '제목', type: 'text' as const, required: true, width: 250 },
        { key: 'method', label: '방법', type: 'textarea' as const, required: true, width: 350 },
        { key: 'effect', label: '기대효과', type: 'textarea' as const, required: true, width: 300 },
        { key: 'leadershipTip', label: '리더십 팁', type: 'textarea' as const, required: true, width: 350 },
      ]}
    />
  );
}
