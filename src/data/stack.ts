// 홈의 기술 스택 — 로고가 흐르는 줄(LogoLoop)과 분야별 목록이 여기서 나와요.
// 로고는 simple-icons(각 회사 상표, 보여 주기용으로만). C#처럼 simple-icons에 없는 건 글자 배지로.
import {
  siClaude,
  siCloudflareworkers,
  siDocker,
  siFlutter,
  siLinux,
  siNodedotjs,
  siPython,
  siReact,
  siSupabase,
  siTypescript,
  siUnity,
  siVite,
  type SimpleIcon
} from 'simple-icons';

export interface StackItem {
  name: string;
  icon?: SimpleIcon;
  /** 아이콘 대신 보여 줄 짧은 글자 (로고가 없는 것) */
  badge?: string;
}

export interface StackGroup {
  key: 'game' | 'ai' | 'web';
  title: string;
  items: StackItem[];
}

export const stackGroups: StackGroup[] = [
  {
    key: 'game',
    title: '게임',
    items: [{ name: 'Unity', icon: siUnity }, { name: 'C#', badge: 'C#' }, { name: 'Flutter', icon: siFlutter }]
  },
  {
    key: 'ai',
    title: 'AI',
    items: [{ name: 'Claude API', icon: siClaude }, { name: 'Python', icon: siPython }, { name: '로컬 LLM', badge: 'LLM' }]
  },
  {
    key: 'web',
    title: '웹',
    items: [
      { name: 'TypeScript', icon: siTypescript },
      { name: 'React', icon: siReact },
      { name: 'Node.js', icon: siNodedotjs },
      { name: 'Vite', icon: siVite },
      { name: 'Cloudflare Workers', icon: siCloudflareworkers },
      { name: 'Supabase', icon: siSupabase },
      { name: 'Docker', icon: siDocker },
      { name: 'Linux', icon: siLinux }
    ]
  }
];

export const stackAll: StackItem[] = stackGroups.flatMap((g) => g.items);
