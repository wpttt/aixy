import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DifyApp, Conversation, Message, AppsConfig } from '@/types';

interface AppState {
  // 配置
  config: AppsConfig | null;
  setConfig: (config: AppsConfig) => void;

  // 当前聊天状态
  currentAppId: string | null;
  setCurrentAppId: (appId: string | null) => void;

  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;

  // 消息列表
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;

  // 思考模式
  thinkingMode: boolean;
  setThinkingMode: (enabled: boolean) => void;

  // UI 状态
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // 获取当前应用配置
  getCurrentApp: () => DifyApp | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      config: null,
      setConfig: (config) => set({ config }),

      currentAppId: null,
      setCurrentAppId: (appId) => set({ currentAppId: appId }),

      currentConversationId: null,
      setCurrentConversationId: (id) => set({ currentConversationId: id }),

      messages: [],
      setMessages: (messagesOrFn) => set((state) => {
        if (typeof messagesOrFn === 'function') {
          return { messages: messagesOrFn(Array.isArray(state.messages) ? state.messages : []) };
        }
        return { messages: Array.isArray(messagesOrFn) ? messagesOrFn : [] };
      }),
      addMessage: (message) => set((state) => ({ messages: [...(Array.isArray(state.messages) ? state.messages : []), message] })),
      updateMessage: (id, updates) => set((state) => ({
        messages: (Array.isArray(state.messages) ? state.messages : []).map((m) => m.id === id ? { ...m, ...updates } : m),
      })),
      clearMessages: () => set({ messages: [] }),

      thinkingMode: true,
      setThinkingMode: (enabled) => set({ thinkingMode: enabled }),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      getCurrentApp: () => {
        const { config, currentAppId } = get();
        if (!config || !currentAppId) return null;
        return config.apps.find(app => app.id === currentAppId) || null;
      },
    }),
    {
      name: 'aiac-storage',
      partialize: (state) => ({
        thinkingMode: state.thinkingMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
