import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AppsConfig } from '@/types';

const DEFAULT_CONFIG: AppsConfig = {
  dify: {
    baseUrl: 'http://localhost/v1',
    siteTitle: 'AI 导航中心',
  },
  home: {
    title: '你的专属智能助手中枢',
    subtitle: '由 Dify 驱动，汇聚多个领域智能助手，一站式访问，开箱即用',
    tag: 'AI Hub',
  },
  apps: [],
};

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'apps-config.json');

    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const configData = fs.readFileSync(configPath, 'utf-8');
    const config: AppsConfig = JSON.parse(configData);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to load config:', error);
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const config: AppsConfig = await request.json();
    const configPath = path.join(process.cwd(), 'apps-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save config:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
