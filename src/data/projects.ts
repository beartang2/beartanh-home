// 프로젝트 목록 — 프로젝트 탭(/projects/)과 상세 페이지(/projects/<slug>/), 홈의 '최근 프로젝트'가 모두 여기서 나와요.
// 개발한 순서대로 번호(P-000…)를 매기고, 새 프로젝트는 배열 끝에 추가하면 돼요. 화면에는 최신 것부터 보여요.
// 상세 페이지 글(why·how·now)은 해요체로 짧게. 이미지는 public/projects/<slug>.png (없으면 색 배경 + 이름)

export type ProjectStatus = 'live' | 'wip' | 'archived';

export interface Project {
  /** 아카이브 번호. P-000부터 순서대로 */
  id: string;
  /** 주소 /projects/<slug>/ — 한 번 정하면 바꾸지 않기 (검색에 쌓인 주소가 끊김) */
  slug: string;
  title: string;
  /** 시작 또는 공개 시점. "2026" 또는 "2026.10" */
  date: string;
  status: ProjectStatus;
  /** 카드에 한 줄 */
  tagline: string;
  /** 카드·목록에 두세 줄 */
  summary: string;
  stack: string[];
  /** 공개 주소 */
  url?: string;
  /** 대표 이미지 (public 아래 경로). 없으면 accent 색 배경 */
  image?: string;
  /** 카드 배경 색 (이미지 없을 때·이미지 뒤) */
  accent: string;
  /** 상세 페이지 문단들 */
  why: string[];
  how: string[];
  now: string[];
}

export const projects: Project[] = [
  {
    id: 'P-000',
    slug: 'beartanh-dev',
    title: 'beartanh.dev',
    date: '2026.10',
    status: 'live',
    tagline: '만든 것들을 모아 두는 곳',
    summary: '지금 보고 있는 이 사이트예요. 프로젝트를 모아 두고, AI 비서 네코가 쓰는 뉴스를 싣고 있어요.',
    stack: ['React', 'Vite', 'React Bits', 'Cloudflare Workers'],
    url: 'https://beartanh.dev/',
    image: '/og.png',
    accent: '#0d2240',
    why: ['만든 것들이 여기저기 흩어져 있어서, 한 주소에서 보고 소개할 수 있는 곳이 필요했어요.'],
    how: [
      'React와 Vite로 만들고, 빌드할 때 페이지마다 화면을 미리 그려서 HTML에 넣어요. 그래서 자바스크립트를 실행하지 않는 검색로봇도 내용을 읽을 수 있어요.',
      '뉴스 탭은 AI 비서 네코가 발행 API로 글을 보내면, Cloudflare Worker가 형식을 검사한 뒤 저장소에 글 파일로 올리고 자동으로 다시 배포해요.'
    ],
    now: ['운영 중이에요. 프로젝트가 생길 때마다 여기에 기록해요.']
  },
  {
    id: 'P-001',
    slug: 'ganghwa-rpg',
    title: '강화 RPG',
    date: '2026.08',
    status: 'live',
    tagline: '깨지면 처음부터, 확률 강화 웹게임',
    summary:
      '친구들 단톡방 봇으로 시작한 확률 강화 웹게임이에요. 무기를 강화하다 깨지면 처음부터 다시 하고, 파티 레이드·채굴·랭킹으로 같이 놀아요.',
    stack: ['Node.js', 'Supabase', 'Vercel'],
    url: 'https://ganghwa.beartanh.dev/',
    accent: '#3a1d12',
    why: ['친구들 단톡방에서 돌리던 강화 봇이 생각보다 오래 사랑받아서, 웹에서도 같이 놀 수 있게 게임으로 키웠어요.'],
    how: [
      '무기를 강화할수록 성공 확률은 내려가고, 깨지면 처음부터 다시 해요. 한 번의 버튼이 주는 긴장감이 핵심이에요.',
      '혼자 하는 강화에 더해 파티 레이드, 채굴, 랭킹으로 친구들과 같이 즐길 거리를 넣었어요. 서버는 Node.js, 데이터는 Supabase에 두고 Vercel에서 운영해요.'
    ],
    now: ['운영 중이에요.']
  },
  {
    id: 'P-002',
    slug: 'jjimhalkka',
    title: '찜할까?',
    date: '2026.10',
    status: 'live',
    tagline: '해외 스팀 리뷰가 한눈에, 한국에.',
    summary:
      '스팀 인기 게임의 한국어·영어·중국어·일본어·러시아어 리뷰를 언어권별로 모아 한국어로 요약하고, 지금 살지 말지 판정해 줘요.',
    stack: ['Cloudflare Workers', 'Claude API', 'React', 'GitHub Actions'],
    url: 'https://jjimhalkka.beartanh.dev/',
    image: '/projects/jjimhalkka.png',
    accent: '#f5f5f7',
    why: [
      '스팀에서는 한국어 리뷰만 골라 보거나, 다른 언어 리뷰를 원문으로 읽어야 해요. 같은 게임도 언어권마다 반응이 크게 다른데 그걸 한눈에 보기 어려웠어요.'
    ],
    how: [
      '매주 월요일 스팀 인기 게임 100개와 무료 게임 20개를 골라, 언어마다 최근 도움이 된 리뷰를 모아요. Claude가 언어권별로 좋았던 점과 아쉬운 점을 한국어로 정리하고, 문장마다 근거 리뷰 링크를 달아요.',
      '긍정률·가격·판정 같은 숫자는 AI가 아니라 스팀 수치로 코드가 계산해요. 가격은 매일 다시 확인해서 기록하고, "구매 각"부터 "이건 패스"까지 판정을 매겨요.',
      '서버 없이 GitHub Actions가 수집과 요약을 돌리고, 결과를 정적 페이지로 만들어 Cloudflare Workers에 배포해요.'
    ],
    now: ['운영 중이에요. 매주 리포트와 매일 가격 기록이 쌓이고 있어요.']
  }
];

/** 최신 것부터 (번호 역순) */
export const projectsNewest = [...projects].reverse();

export const findProject = (slug: string) => projects.find((p) => p.slug === slug) ?? null;

export const projectPath = (p: Pick<Project, 'slug'>) => `/projects/${p.slug}/`;

export const statusLabel: Record<ProjectStatus, string> = {
  live: '운영 중',
  wip: '작업 중',
  archived: '보관'
};
