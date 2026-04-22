import { DifyChatMessage, DifyUsage, ChatRequest, FileInfo } from '@/types';

export class DifyClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async *chatMessages(
    request: ChatRequest,
    app: { difyAppId: string; variables?: Array<{ name: string; label: string; type: string; required: boolean; default?: string }> }
  ): AsyncGenerator<DifyChatMessage, void, unknown> {
    const url = `${this.baseUrl}/v1/chat-messages`;

    // 构建 inputs
    const inputs: Record<string, string> = {};
    if (request.inputs) {
      Object.entries(request.inputs).forEach(([key, value]) => {
        inputs[key] = value;
      });
    }

    // 如果有文件，添加到 inputs
    if (request.file) {
      inputs['file'] = request.file.data;
      inputs['file_name'] = request.file.name;
      inputs['file_type'] = request.file.type;
    }

    const body: Record<string, unknown> = {
      inputs,
      query: request.query,
      response_mode: request.responseMode || 'streaming',
      conversation_id: request.conversationId || '',
      user: 'user-' + Date.now(),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} ${errorText}`);
    }

    if (response.body === null) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6)) as DifyChatMessage;
            yield data;
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  }

  async uploadFile(file: FileInfo): Promise<{ id: string; url: string }> {
    const url = `${this.baseUrl}/v1/upload-file`;
    const formData = new FormData();
    const blob = await fetch(`data:${file.type};base64,${file.data}`).then(r => r.blob());
    formData.append('file', blob, file.name);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status}`);
    }

    return response.json();
  }
}

export function parseSSEEvent(data: string): DifyChatMessage | null {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function extractUsage(metadata?: any): DifyUsage | undefined {
  if (!metadata) return undefined;
  return metadata.usage;
}

export function extractCitations(metadata?: any): Array<{ index: number; content: string; url?: string }> {
  if (!metadata?.citations) return [];
  return metadata.citations.map((c: any, i: number) => ({
    index: i,
    content: c.content || c.text || '',
    url: c.url || c.link,
  }));
}
