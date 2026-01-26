'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Users,
  MessageCircle,
  Lightbulb,
  UserCheck,
  Heart,
  LogOut,
  Monitor,
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';

const menuItems = [
  { href: '/admin/questions', label: '설문문항', icon: FileText },
  { href: '/admin/leadership', label: '리더십 유형', icon: Users },
  { href: '/admin/concerns', label: '고민 키워드', icon: MessageCircle },
  { href: '/admin/solutions', label: '솔루션', icon: Lightbulb },
  { href: '/admin/followership', label: '팔로워십 유형', icon: UserCheck },
  { href: '/admin/compatibility', label: '궁합', icon: Heart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAdminStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin') return;

    if (!isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, pathname, router]);

  // Show only children for login page
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  // Show layout with sidebar for authenticated pages
  if (!isAuthenticated) {
    return null;
  }

  // Mobile warning
  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <Monitor className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            PC에서 접속해주세요
          </h1>
          <p className="text-gray-600">
            관리자 페이지는 PC 환경(1024px 이상)에서 최적화되어 있습니다.
            데스크톱 또는 노트북에서 접속해주세요.
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/admin');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-white shadow-lg fixed left-0 top-0 bottom-0 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            LeadMind Admin
          </h1>
          <p className="text-sm text-gray-500">콘텐츠 관리 시스템</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            콘텐츠 관리
          </p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[var(--color-violet-100)] text-[var(--color-primary)] font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content - With left margin for sidebar */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
