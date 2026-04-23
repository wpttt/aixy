'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppsConfig, DifyApp } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_BADGES: Record<string, { class: string; label: string }> = {
  chat: { class: 'bg-[rgba(88,166,255,0.15)] text-[#58a6ff] border-[rgba(88,166,255,0.25)]', label: '对话型' },
  agent: { class: 'bg-[rgba(63,185,80,0.15)] text-[#3fb950] border-[rgba(63,185,80,0.25)]', label: 'Agent' },
  flow: { class: 'bg-[rgba(210,153,34,0.15)] text-[#d29922] border-[rgba(210,153,34,0.25)]', label: '工作流' },
  completion: { class: 'bg-[rgba(57,197,207,0.15)] text-[#39c5cf] border-[rgba(57,197,207,0.25)]', label: '文本生成' },
  link: { class: 'bg-[rgba(63,185,80,0.15)] text-[#3fb950] border-[rgba(63,185,80,0.25)]', label: '链接' },
};

export default function AdminPage() {
  const [config, setConfig] = useState<AppsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ appId: string; appName: string } | null>(null);
  const [deleteInput, setDeleteInput] = useState('');

  const [baseUrl, setBaseUrl] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [siteLogo, setSiteLogo] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [editingApp, setEditingApp] = useState<DifyApp | null>(null);

  const [homeTitle, setHomeTitle] = useState('');
  const [homeSubtitle, setHomeSubtitle] = useState('');
  const [homeTag, setHomeTag] = useState('');
  const [homeTagLink, setHomeTagLink] = useState('');

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('admin-auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/apps')
        .then((res) => res.json())
        .then((data) => {
          setConfig(data);
          setBaseUrl(data.dify?.baseUrl || '');
          setSiteTitle(data.dify?.siteTitle || 'DifyHub');
          setSiteLogo(data.dify?.siteLogo || '');
          setApiKey(data.dify?.apiKey || '');
          setHomeTitle(data.home?.title || '你的专属智能助手中枢');
          setHomeSubtitle(data.home?.subtitle || '由 Dify 驱动，汇聚多个领域智能助手，一站式访问，开箱即用');
          setHomeTag(data.home?.tag || 'AI Assistant Hub');
          setHomeTagLink(data.home?.tagLink || '');
        })
        .catch((err) => {
          console.error('Failed to load config:', err);
          showMessage('error', '加载配置失败');
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!password) {
      showMessage('error', '请输入密码');
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin-auth', 'true');
      } else {
        const data = await res.json();
        showMessage('error', data.error || '密码错误');
      }
    } catch {
      showMessage('error', '验证失败，请稍后重试');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveGlobal = async () => {
    if (!config) return;
    setSaving(true);

    const newConfig = {
      ...config,
      dify: {
        ...config.dify,
        baseUrl,
        siteTitle,
        siteLogo,
        apiKey,
      },
      home: {
        title: homeTitle,
        subtitle: homeSubtitle,
        tag: homeTag,
        tagLink: homeTagLink,
      },
    };

    try {
      const res = await fetch('/api/apps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (res.ok) {
        setConfig(newConfig);
        document.title = siteTitle;
        showMessage('success', '✓ 配置已保存');
      } else {
        showMessage('error', '保存失败');
      }
    } catch (err) {
      showMessage('error', '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAppChange = (field: keyof DifyApp, value: string) => {
    if (!editingApp) return;
    setEditingApp({ ...editingApp, [field]: value } as DifyApp);
  };

  const handleTagsChange = (value: string) => {
    if (!editingApp) return;
    const tags = value.split(',').map(t => t.trim()).filter(t => t);
    setEditingApp({ ...editingApp, tags });
  };

  const handleSaveApp = async () => {
    if (!config || !editingApp) return;
    setSaving(true);

    const apps = config.apps.map((a) => (a.id === editingApp.id ? editingApp : a));
    if (!apps.find(a => a.id === editingApp.id)) {
      apps.push(editingApp);
    }
    const newConfig = { ...config, apps };

    try {
      const res = await fetch('/api/apps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (res.ok) {
        setConfig(newConfig);
        setEditingApp(null);
        showMessage('success', '✓ 应用配置已保存');
      } else {
        showMessage('error', '保存失败');
      }
    } catch (err) {
      showMessage('error', '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAddApp = () => {
    if (!config) return;

    const newApp: DifyApp = {
      id: `app-${Date.now()}`,
      name: '新链接',
      logo: '🔗',
      iconBg: 'rgba(74,222,128,0.15)',
      type: 'link',
      description: '点击访问外部链接',
      url: '',
      tags: [],
    };

    setEditingApp(newApp);
  };

  const handleDeleteApp = async (appId: string) => {
    if (!config) return;

    setSaving(true);
    const apps = config.apps.filter((a) => a.id !== appId);
    const newConfig = { ...config, apps };

    try {
      const res = await fetch('/api/apps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (res.ok) {
        setConfig(newConfig);
        setDeleteConfirm(null);
        setDeleteInput('');
        showMessage('success', '✓ 应用已删除');
      } else {
        showMessage('error', '删除失败');
      }
    } catch (err) {
      showMessage('error', '删除失败');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-8 w-full max-w-[360px]">
          <h1 className="text-[20px] font-bold mb-6 text-center">配置管理</h1>
          <div className="mb-4">
            <label className="text-[13px] text-[var(--text2)] block mb-2">访问密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="请输入密码"
              className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-[var(--accent)] text-white rounded-[10px] text-[14px] hover:bg-[#6c5fe0] transition-colors"
          >
            进入配置
          </button>
          {message && (
            <div className="mt-4 text-center text-[14px] text-[var(--red)]">
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="w-full max-w-[900px] mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--text2)] text-[13px] hover:text-[var(--text)] transition-colors"
          >
            <span>←</span>
            <span>返回首页</span>
          </Link>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
          <span className="font-semibold text-[20px]">配置管理</span>
        </div>
      </header>

      <main className="w-full max-w-[900px] mx-auto px-6 mt-10 pb-20">
        {/* Message toast */}
        {message && (
          <div
            className={cn(
              'fixed top-6 right-6 px-6 py-3 rounded-full text-[14px] z-50 animate-fadeIn',
              message.type === 'success' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--red)] text-white'
            )}
          >
            {message.text}
          </div>
        )}

        {/* Global settings */}
        <section className="mb-10">
          <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2.5">
            <span>🌐</span>
            <span>全局设置</span>
          </h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[16px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <div className="text-[14px] font-medium text-[var(--text)]">RAG 服务地址</div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">RAG API 基础地址</div>
              </div>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost/v1"
                className="w-[280px] px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
              />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <div className="text-[14px] font-medium text-[var(--text)]">网站标题</div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">显示在首页标题和浏览器标签</div>
              </div>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="DifyHub"
                className="w-[200px] px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
              />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <div className="text-[14px] font-medium text-[var(--text)]">网站 Logo</div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">显示在首页标题左侧</div>
              </div>
              <div className="flex items-center gap-3">
                {siteLogo && (
                  <img src={siteLogo} alt="Logo" className="w-8 h-8 object-contain rounded" />
                )}
                <label className="px-4 py-2 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text2)] cursor-pointer hover:bg-[var(--bg2)] transition-colors">
                  <span>上传图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.url) {
                          setSiteLogo(data.url);
                          showMessage('success', '✓ Logo 上传成功');
                        }
                      } catch {
                        showMessage('error', '上传失败');
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-[14px] font-medium text-[var(--text)]">API Key</div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">Dify API 密钥</div>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="app-xxxxxxxx"
                className="w-[280px] px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
              />
            </div>
          </div>
        </section>

        {/* Homepage settings */}
        <section className="mb-10">
          <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2.5">
            <span>🏠</span>
            <span>首页内容配置</span>
          </h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[16px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <div className="text-[14px] font-medium text-[var(--text)]">首页大标题</div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">首页中央醒目文字</div>
              </div>
              <input
                type="text"
                value={homeTitle}
                onChange={(e) => setHomeTitle(e.target.value)}
                placeholder="你的专属智能助手中枢"
                className="w-[280px] px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
              />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <div className="text-[14px] font-medium text-[var(--text)]">首页副标题</div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">大标题下方的描述文字</div>
              </div>
              <input
                type="text"
                value={homeSubtitle}
                onChange={(e) => setHomeSubtitle(e.target.value)}
                placeholder="由 Dify 驱动..."
                className="w-[280px] px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
              />
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-[14px] font-medium text-[var(--text)]">首页标签</div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">顶部小标签文字及跳转链接</div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={homeTag}
                  onChange={(e) => setHomeTag(e.target.value)}
                  placeholder="AI Assistant Hub"
                  className="w-[140px] px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
                />
                <input
                  type="text"
                  value={homeTagLink}
                  onChange={(e) => setHomeTagLink(e.target.value)}
                  placeholder="跳转链接（选填）"
                  className="w-[180px] px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveGlobal}
            disabled={saving}
            className="mt-4 px-6 py-2.5 bg-[var(--accent)] text-white rounded-[10px] text-[14px] hover:bg-[#6c5fe0] transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '💾 保存配置'}
          </button>
        </section>

        {/* App configs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold flex items-center gap-2.5">
              <span>📦</span>
              <span>应用配置</span>
            </h2>
            <button
              onClick={handleAddApp}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[10px] text-[13px] hover:bg-[#6c5fe0] transition-colors"
            >
              <span>＋</span>
              <span>添加应用</span>
            </button>
          </div>

          <div className="space-y-4">
            {config?.apps.map((app) => {
              const badge = TYPE_BADGES[app.type || 'chat'] || TYPE_BADGES.chat;
              const isConfirming = deleteConfirm?.appId === app.id;
              return (
                <div
                  key={app.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px] shrink-0"
                        style={{ background: app.iconBg || 'var(--surface2)' }}
                      >
                        {app.logo.startsWith('/') ? (
                          <img src={app.logo} alt={app.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <span>{app.logo}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium">{app.name}</span>
                          <span className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full border',
                            badge.class
                          )}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-[12px] text-[var(--text3)] max-w-[300px] truncate">{app.url || '无链接'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            placeholder="确认应用名"
                            className="w-[120px] px-2 py-1 bg-[var(--bg2)] border border-[var(--border)] rounded-[6px] text-[12px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (deleteInput === app.name) {
                                handleDeleteApp(app.id);
                              } else {
                                showMessage('error', '名称不匹配');
                              }
                            }}
                            disabled={deleteInput !== app.name}
                            className="px-2 py-1 bg-[var(--red)] text-white rounded-[6px] text-[12px] hover:bg-[#e53935] transition-colors disabled:opacity-50"
                          >
                            确认
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirm(null);
                              setDeleteInput('');
                            }}
                            className="px-2 py-1 bg-[var(--surface2)] border border-[var(--border)] rounded-[6px] text-[12px] text-[var(--text2)] hover:bg-[var(--bg2)] transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingApp(app)}
                            className="px-3 py-1.5 bg-[var(--surface2)] border border-[var(--border)] rounded-[8px] text-[12px] text-[var(--text2)] hover:bg-[var(--bg2)] transition-colors"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirm({ appId: app.id, appName: app.name });
                              setDeleteInput('');
                            }}
                            className="px-3 py-1.5 bg-[var(--surface2)] border border-[var(--border)] rounded-[8px] text-[12px] text-[var(--red)] hover:bg-[var(--bg2)] transition-colors"
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {app.tags && app.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-3">
                      {app.tags.map((tag) => (
                        <span key={tag} className="text-[11px] text-[var(--text3)] bg-[var(--bg2)] border border-[var(--border)] px-2 py-1 rounded-md">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
          <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-[16px] w-full max-w-[560px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--bg2)]">
              <h2 className="text-[18px] font-bold">
                {config?.apps.find((a) => a.id === editingApp.id) ? '编辑链接' : '添加应用'}
              </h2>
              <button
                onClick={() => setEditingApp(null)}
                className="p-1 text-[var(--text2)] hover:text-[var(--text)] text-[20px]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] text-[var(--text2)] block mb-2">显示名称</label>
                  <input
                    type="text"
                    value={editingApp.name}
                    onChange={(e) => handleAppChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-[var(--text2)] block mb-2">图标 Emoji</label>
                  <input
                    type="text"
                    value={editingApp.logo}
                    onChange={(e) => handleAppChange('logo', e.target.value)}
                    className="w-[80px] px-4 py-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] text-[var(--text2)] block mb-2">链接地址 URL</label>
                <input
                  type="text"
                  value={editingApp.url || ''}
                  onChange={(e) => handleAppChange('url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
                />
              </div>

              <div>
                <label className="text-[13px] text-[var(--text2)] block mb-2">链接类型</label>
                <select
                  value={editingApp.type || 'link'}
                  onChange={(e) => handleAppChange('type', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
                >
                  <option value="link">链接</option>
                  <option value="chat">对话型</option>
                  <option value="agent">Agent</option>
                  <option value="flow">工作流</option>
                  <option value="completion">文本生成</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] text-[var(--text2)] block mb-2">应用简介</label>
                <textarea
                  value={editingApp.description}
                  onChange={(e) => handleAppChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)] resize-none"
                />
              </div>

              <div>
                <label className="text-[13px] text-[var(--text2)] block mb-2">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={editingApp.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="标签1, 标签2"
                  className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-[10px] text-[14px] text-[var(--text)] outline-none focus:border-[rgba(123,111,240,0.4)]"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[var(--border)] flex gap-3">
              <button
                onClick={handleSaveApp}
                disabled={saving}
                className="flex-1 px-6 py-2.5 bg-[var(--accent)] text-white rounded-[10px] text-[14px] hover:bg-[#6c5fe0] transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '💾 保存'}
              </button>
              <button
                onClick={() => setEditingApp(null)}
                className="px-6 py-2.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--text2)] rounded-[10px] text-[14px] hover:bg-[var(--surface2)] transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}