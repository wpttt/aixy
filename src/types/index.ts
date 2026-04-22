export interface DifyApp {
  id: string;
  name: string;
  logo: string;
  iconBg?: string;
  type?: 'chat' | 'agent' | 'flow' | 'completion' | 'link';
  description: string;
  url?: string; // URL link for the card (when set, card becomes a URL link card)
  tags?: string[];
  quickPrompts?: string[];
  features?: AppFeatures;
}

export interface DifyVariable {
  name: string;
  label: string;
  type: string;
  required: boolean;
  default?: string;
}

export interface AppFeatures {
  enableVoice: boolean;
  enableFileUpload: boolean;
  enableWebSearch: boolean;
  enableThinking: boolean;
  showTokenUsage: boolean;
  showCitations: boolean;
}

export interface DifyConfig {
  baseUrl: string;
  siteTitle?: string;
  siteLogo?: string;
  apiKey?: string;
}

export interface HomeConfig {
  title: string;
  subtitle: string;
  tag: string;
  tagLink?: string;
}

export interface AppsConfig {
  dify: DifyConfig;
  apps: DifyApp[];
  home?: HomeConfig;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
}

export interface MessageMetadata {
  tokens?: number;
  citations?: Citation[];
  thinking?: string;
  agentMessages?: string[];
}

export interface Citation {
  index: number;
  content: string;
  url?: string;
}

export interface Conversation {
  id: string;
  appId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  appId: string;
  query: string;
  inputs?: Record<string, string>;
  conversationId?: string;
  responseMode?: 'blocking' | 'streaming';
  file?: FileInfo;
}

export interface FileInfo {
  type: string;
  name: string;
  data: string; // base64
}

export interface DifyChatMessage {
  event: string;
  message_id?: string;
  conversation_id?: string;
  mode?: string;
  answer?: string;
  references?: any[];
  metadata?: any;
  usage?: DifyUsage;
  created_at?: number;
  error?: string;
}

export interface DifyUsage {
  prompt_tokens: number;
  prompt_unit_price: string;
  prompt_price_unit: string;
  prompt_price: string;
  completion_tokens: number;
  completion_unit_price: string;
  completion_price_unit: string;
  completion_price: string;
  total_tokens: number;
  total_price: string;
  model_name: string;
  latencies?: number;
}
