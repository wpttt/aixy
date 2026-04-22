'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { fileToBase64Data } from '@/lib/utils';
import { FileInfo } from '@/types';

interface ChatInputProps {
  onSend: (message: string, file?: FileInfo) => void;
  disabled?: boolean;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
}

export function ChatInput({
  onSend,
  disabled,
  enableVoice,
  enableFileUpload,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    let fileInfo: FileInfo | undefined;
    if (file) {
      const base64 = await fileToBase64Data(file);
      fileInfo = { type: file.type, name: file.name, data: base64 };
    }

    onSend(input.trim(), fileInfo);
    setInput('');
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const startVoiceRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别，请使用 Chrome 或 Edge');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setInput((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim() || file;

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg)] px-7 py-5">
      {/* File preview */}
      {file && (
        <div className="mb-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-[rgba(123,111,240,0.1)] flex items-center justify-center shrink-0">
              <span className="text-lg">📎</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-[var(--text3)]">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setFile(null)} className="p-2 hover:bg-[var(--surface2)] rounded-lg transition-colors">
              <span className="text-[var(--text3)]">✕</span>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        {enableVoice && (
          <button
            onClick={isListening ? stopVoiceRecording : startVoiceRecording}
            className={cn(
              'tool-btn',
              isListening && 'active'
            )}
            type="button"
          >
            <span>🎤</span>
            <span>语音</span>
          </button>
        )}

        {enableFileUpload && (
          <label className="tool-btn cursor-pointer">
            <span>📎</span>
            <span>文件</span>
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </label>
        )}

        {isListening && (
          <div className="listening-indicator active ml-2">
            <span className="w-2 h-2 bg-[#f87171] rounded-full animate-blink" />
            <span>正在聆听…</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="flex items-end gap-3">
        <div className="flex-1 bg-[var(--surface)] border border-[var(--border2)] rounded-[14px] px-4 py-3 focus-within:border-[rgba(123,111,240,0.4)] transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，Ctrl+Enter 发送…"
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent resize-none outline-none text-[var(--text)] text-[14px] leading-relaxed max-h-40 overflow-y-auto placeholder:text-[var(--text3)]"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !canSend}
          className={cn(
            'w-9 h-9 rounded-[10px] flex items-center justify-center transition-all shrink-0',
            canSend && !disabled
              ? 'bg-[var(--accent)] text-white hover:bg-[#6c5fe0] shadow-lg shadow-[var(--accent)]/25'
              : 'bg-[var(--surface2)] text-[var(--text3)] cursor-not-allowed'
          )}
          type="button"
          title="发送消息"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Hints */}
      <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--text3)]">
        <span>Enter 发送 · Shift+Enter 换行</span>
        {input.length > 0 && <span>{input.length}</span>}
      </div>
    </div>
  );
}
