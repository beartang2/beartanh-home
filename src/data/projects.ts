// 아카이브에 보이는 프로젝트 목록.
// 개발한 순서대로 번호를 매기고, 새 프로젝트는 배열 끝에 추가하면 돼요.

export type ProjectStatus = 'live' | 'wip' | 'archived';

export interface Project {
  /** 아카이브 번호. P-000부터 순서대로 */
  id: string;
  title: string;
  /** 시작 또는 공개 시점. "2026" 또는 "2026.10" */
  date: string;
  status: ProjectStatus;
  summary: string;
  stack: string[];
  /** 공개 주소가 있으면 카드 전체가 이 링크로 연결돼요 */
  url?: string;
}

export const projects: Project[] = [
  {
    id: 'P-000',
    title: 'beartanh.dev',
    date: '2026.10',
    status: 'live',
    summary: '지금 보고 있는 이 사이트예요. 만든 것들을 한곳에 모아 두는 아카이브로 쓰고 있어요.',
    stack: ['React', 'Vite', 'React Bits', 'Cloudflare Workers']
  },
  {
    id: 'P-001',
    title: '강화 RPG',
    date: '2026.08',
    status: 'live',
    summary:
      '친구들 단톡방 봇으로 시작한 확률 강화 웹게임이에요. 무기를 강화하다 깨지면 처음부터 다시 하고, 파티 레이드·채굴·랭킹으로 같이 놀아요.',
    stack: ['Node.js', 'Supabase', 'Vercel'],
    url: 'https://gganghwa.beartanh.dev/'
  },
  {
    id: 'P-002',
    title: '찜할까?',
    date: '2026.10',
    status: 'live',
    summary:
      '스팀에서는 한국어 리뷰만 골라 보거나 다른 언어 리뷰를 원문으로 읽어야 해요. 인기 게임의 여러 언어 리뷰를 모아 한국어로 요약해 주는 서비스예요.',
    stack: ['Cloudflare Workers', 'Claude API'],
    url: 'https://jjimhalkka.beartanh.dev/'
  }
];

/** 다음 빈 슬롯 번호 (마지막 번호 + 1) */
export const nextProjectId = (() => {
  const last = Math.max(-1, ...projects.map(p => Number(p.id.replace(/\D/g, '')) || 0));
  return `P-${String(last + 1).padStart(3, '0')}`;
})();

export const statusLabel: Record<ProjectStatus, string> = {
  live: '운영 중',
  wip: '작업 중',
  archived: '보관'
};
