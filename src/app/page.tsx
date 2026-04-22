'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppCard } from '@/components/AppCard';
import { AppsConfig } from '@/types';
import { cn } from '@/lib/utils';

export default function Home() {
  const [config, setConfig] = useState<AppsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
    }
  }, []);

  const handle开发中 = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    fetch('/api/apps')
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        document.title = data.dify?.siteTitle || 'DifyHub';
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load config:', err);
        setLoading(false);
      });
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const homeTitle = config?.home?.title || '你的专属智能助手中枢';
  const homeSubtitle = config?.home?.subtitle || '由 Dify 驱动，汇聚多个领域智能助手，一站式访问，开箱即用';
  const homeTag = config?.home?.tag || 'AI Assistant Hub';
  const homeTagLink = config?.home?.tagLink || '';

  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-y-auto">
      {/* Header */}
      <header className="w-full max-w-[1100px] mx-auto px-6 pt-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {config?.dify?.siteLogo ? (
            <img src={config.dify.siteLogo} alt="Logo" className="w-8 h-8 object-contain" />
          ) : (
            <img src="/logos/logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
          )}
          <span className="font-semibold text-[20px]">{config?.dify?.siteTitle || 'DifyHub'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)] border border-[var(--border2)] text-[var(--text2)] text-[13px] rounded-[10px] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all"
            title={isDark ? '切换到亮色主题' : '切换到暗色主题'}
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          {homeTag && (
            homeTagLink ? (
              <a
                href={homeTagLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-[rgba(123,111,240,0.1)] border border-[rgba(123,111,240,0.25)] text-[var(--accent2)] text-[13px] rounded-[10px] hover:bg-[rgba(123,111,240,0.2)] transition-colors"
              >
                <span>✦</span>
                <span>{homeTag}</span>
              </a>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-[rgba(123,111,240,0.1)] border border-[rgba(123,111,240,0.25)] text-[var(--accent2)] text-[13px] rounded-[10px]">
                <span>✦</span>
                <span>{homeTag}</span>
              </span>
            )
          )}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface)] border border-[var(--border2)] text-[var(--text2)] text-[13px] rounded-[10px] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all"
          >
            <span>⚙</span>
            <span>页面配置</span>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="w-full max-w-[1100px] mx-auto px-6 pt-20 pb-20 text-center relative">
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(123,111,240,0.08) 0%, transparent 70%)',
          }}
        />

        <h1 className="font-bold text-[clamp(36px,6vw,72px)] leading-[1.0] tracking-[-2px] mb-6">
          {homeTitle}
        </h1>

        <p className="text-[17px] text-[var(--text2)] max-w-md mx-auto leading-relaxed">
          {homeSubtitle}
        </p>
      </section>

      {/* Apps section */}
      <section className="w-full max-w-[1100px] mx-auto px-6 pb-24">
        <div className="flex items-center gap-4 mb-7">
          <span className="text-[13px] text-[var(--text3)] uppercase tracking-wider whitespace-nowrap">应用入口</span>
          <div className="h-px bg-[var(--border)] flex-1" />
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-[var(--surface)] rounded-[16px] p-7 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-[52px] h-[52px] rounded-[14px] bg-[var(--bg2)]" />
                  <div className="w-16 h-5 bg-[var(--bg2)] rounded-full" />
                </div>
                <div className="h-6 w-32 bg-[var(--bg2)] rounded mb-3" />
                <div className="h-4 w-full bg-[var(--bg2)] rounded mb-2" />
                <div className="h-4 w-2/3 bg-[var(--bg2)] rounded" />
              </div>
            ))}
          </div>
        ) : config?.apps && config.apps.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {config.apps.map((app, index) => (
              <div key={app.id} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <AppCard app={app} index={index} on开发中={handle开发中} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--surface)] flex items-center justify-center">
              <span className="text-[40px] opacity-40">📦</span>
            </div>
            <h3 className="text-lg font-medium mb-2">暂无应用</h3>
            <p className="text-[var(--text2)] mb-6">请先在配置页面添加应用</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[#6c5fe0] transition-colors"
            >
              <span>＋</span>
              <span>前往配置</span>
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center">
        <p className="text-[13px] text-[var(--text3)]">
          {config?.dify?.siteTitle || 'DifyHub'} © {new Date().getFullYear()}
        </p>
      </footer>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-full text-[14px] text-[var(--text)] shadow-lg animate-fadeIn z-50">
          此应用尚在开发中
        </div>
      )}
    </div>
  );
}