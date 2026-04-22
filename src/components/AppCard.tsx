'use client';

import { DifyApp } from '@/types';
import { cn } from '@/lib/utils';

interface AppCardProps {
  app: DifyApp;
  index: number;
  on开发中?: () => void;
}

const TYPE_BADGES: Record<string, { class: string; label: string }> = {
  chat: { class: 'bg-[rgba(88,166,255,0.15)] text-[#58a6ff] border-[rgba(88,166,255,0.25)]', label: '对话型' },
  agent: { class: 'bg-[rgba(63,185,80,0.15)] text-[#3fb950] border-[rgba(63,185,80,0.25)]', label: 'Agent' },
  flow: { class: 'bg-[rgba(210,153,34,0.15)] text-[#d29922] border-[rgba(210,153,34,0.25)]', label: '工作流' },
  completion: { class: 'bg-[rgba(57,197,207,0.15)] text-[#39c5cf] border-[rgba(57,197,207,0.25)]', label: '文本生成' },
  link: { class: 'bg-[rgba(63,185,80,0.15)] text-[#3fb950] border-[rgba(63,185,80,0.25)]', label: '链接' },
};

export function AppCard({ app, index, on开发中 }: AppCardProps) {
  const badge = TYPE_BADGES[app.type || 'chat'] || TYPE_BADGES.chat;
  const isUrlCard = !!app.url;

  const cardContent = (
    <div
      className={cn(
        'group relative bg-[var(--surface)] border border-[var(--border)] rounded-[16px]',
        'p-6 cursor-pointer transition-all duration-300 ease-out',
        isUrlCard ? 'hover:border-[var(--border2)] hover:bg-[var(--surface2)] hover:-translate-y-1' : 'opacity-75',
        'flex flex-col gap-4',
        'before:content-[""] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px]',
        'before:bg-gradient-to-r before:transparent before:rgba(255,255,255,0.1) before:transparent',
        'before:opacity-0 before:transition-opacity before:duration-300',
        'hover:before:opacity-100'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card top */}
      <div className="flex items-start justify-between">
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px]"
          style={{ background: app.iconBg || 'var(--surface2)' }}
        >
          {app.logo.startsWith('/') ? (
            <img src={app.logo} alt={app.name} className="w-8 h-8 object-contain" />
          ) : (
            <span>{app.logo}</span>
          )}
        </div>
        <span className={cn(
          'text-[11px] px-[10px] py-[4px] rounded-full font-medium tracking-wide',
          'border',
          badge.class
        )}>
          {badge.label}
        </span>
      </div>

      {/* Name */}
      <div>
        <h3 className="font-semibold text-[20px] leading-tight">{app.name}</h3>
      </div>

      {/* Description */}
      <p className="text-[14px] text-[var(--text2)] leading-relaxed flex-1">
        {app.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
        <div className="flex gap-1.5 flex-wrap">
          {app.tags?.map((tag) => (
            <span key={tag} className="text-[11px] text-[var(--text3)] bg-[var(--bg2)] border border-[var(--border)] px-2 py-1 rounded-md">{tag}</span>
          ))}
        </div>
        <span className="text-[var(--text3)] text-lg transition-all duration-200 group-hover:text-[var(--accent2)] group-hover:translate-x-0.5">
          {isUrlCard ? '↗' : '→'}
        </span>
      </div>
    </div>
  );

  if (isUrlCard) {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="animate-fadeIn"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }} onClick={on开发中}>
      {cardContent}
    </div>
  );
}
