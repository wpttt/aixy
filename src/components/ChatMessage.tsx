'use client';

import { useState } from 'react';
import { Message, Citation } from '@/types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  showThinking?: boolean;
  showTokens?: boolean;
  showCitations?: boolean;
  appIcon?: string;
}

export function ChatMessage({ message, showThinking, showTokens, showCitations, appIcon }: ChatMessageProps) {
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [citationsExpanded, setCitationsExpanded] = useState(false);

  const isUser = message.role === 'user';

  const avatar = isUser ? '👤' : (appIcon || '🤖');
  const avatarBg = isUser ? 'rgba(123,111,240,0.15)' : 'var(--surface)';

  return (
    <div className={cn('flex gap-3 animate-fadeIn', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 border text-lg',
          isUser ? 'bg-[rgba(123,111,240,0.15)] border-[rgba(123,111,240,0.25)]' : 'bg-[var(--surface)] border-[var(--border)]'
        )}
        style={{ background: avatarBg }}
      >
        {avatar}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-1.5 max-w-[680px]', isUser ? 'items-end' : 'items-start')}>
        {/* Thinking block */}
        {showThinking && message.metadata?.thinking && (
          <div className="thinking-block">
            <div
              className="thinking-header"
              onClick={() => setThinkingExpanded(!thinkingExpanded)}
            >
              <span>💭 思考过程</span>
              <span className={cn('text-[10px] transition-transform duration-200', thinkingExpanded ? 'rotate-180' : '')}>
                ▼
              </span>
            </div>
            <div className={cn('thinking-content', thinkingExpanded ? 'visible' : '')}>
              {message.metadata.thinking}
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-[18px] py-[14px] rounded-[14px] text-[14px] leading-[1.75]',
            isUser
              ? 'bg-[rgba(123,111,240,0.15)] border border-[rgba(123,111,240,0.2)] text-[var(--text)] rounded-br-[4px]'
              : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-bl-[4px]'
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {isUser ? message.content : renderMarkdownLite(message.content)}
          </div>
        </div>

        {/* Sources */}
        {showCitations && message.metadata?.citations && message.metadata.citations.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setCitationsExpanded(!citationsExpanded)}
              className="flex items-center gap-2 text-[11px] text-[var(--text3)] hover:text-[var(--text)] transition-colors"
            >
              <span>参考来源 ({message.metadata.citations.length})</span>
              <span className={cn('transition-transform', citationsExpanded ? 'rotate-180' : '')}>▼</span>
            </button>
            {citationsExpanded && (
              <div className="flex flex-col gap-1.5 mt-2">
                {message.metadata.citations.map((citation, idx) => (
                  <div key={idx} className="source-item">
                    <span className="text-[11px] text-[var(--text3)] shrink-0">📄</span>
                    <div>
                      <div>{citation.content}</div>
                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent2)] hover:underline text-[12px]"
                        >
                          {citation.url}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className={cn('flex items-center gap-2.5 text-[11px] text-[var(--text3)] px-1', isUser ? 'flex-row-reverse' : '')}>
          {message.metadata?.tokens && message.metadata.tokens > 0 && showTokens && (
            <span className="bg-[var(--bg2)] border border-[var(--border)] px-[7px] py-[2px] rounded-md">
              ≈{message.metadata.tokens} tokens
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Lite markdown rendering
function renderMarkdownLite(text: string): React.ReactNode {
  if (!text) return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 my-2 text-[12px] font-mono overflow-x-auto whitespace-pre">$1</pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-[var(--bg2)] px-[6px] py-[2px] rounded text-[12px] font-mono">$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
