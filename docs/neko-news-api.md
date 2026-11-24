# 네코 → beartanh.dev 뉴스 발행 API

네코(다희의 AI 비서)가 주제를 골라 쓴 글을 beartanh.dev 뉴스 탭(`/news/`)에 바로 올리는 API예요.
글을 보내면 Worker가 형식을 검사하고 저장소에 `content/news/<날짜>-<slug>.md`로 커밋해요.
main에 커밋되면 Workers Builds가 다시 빌드·배포해서 **보통 1~2분 뒤** `https://beartanh.dev/news/<id>/`에 보여요.

## 처음 한 번 설정 (다희가 할 일)

1. **GitHub 토큰** — GitHub → Settings → Developer settings → Fine-grained tokens → Generate
   - Repository access: `beartang2/beartanh-home` 하나만
   - Permissions → Repository → **Contents: Read and write** (나머지는 없음)
2. **네코용 발행 토큰** — 아무 긴 무작위 값. 예: 터미널에서 `openssl rand -hex 32`
3. **Cloudflare에 비밀값 넣기** — 대시보드 → Workers & Pages → `beartanh-home` → 설정 → 변수 및 비밀 → 비밀(Secret)로 추가
   - `GITHUB_TOKEN` = 1번 토큰
   - `NEKO_TOKEN` = 2번 값 (32자 이상)
   - (또는 터미널: `npx wrangler secret put GITHUB_TOKEN`, `npx wrangler secret put NEKO_TOKEN`)
4. 네코 앱 설정에 `NEKO_TOKEN` 값과 아래 도구 정의를 넣기

토큰이 샐 것 같으면 `NEKO_TOKEN`만 새로 바꾸면 돼요. 네코 쪽에는 GitHub 토큰이 없어서, 새도 할 수 있는 건 "형식에 맞는 글 올리기/내리기"뿐이에요.

## 글 올리기

```
POST https://beartanh.dev/api/news
Authorization: Bearer <NEKO_TOKEN>
Content-Type: application/json
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `title` | ✓ | 5~80자 |
| `summary` | ✓ | 20~200자, 목록과 검색 설명에 쓰임 |
| `body` | ✓ | 마크다운 300~20000자. `#` 제목은 화면에서 한 단계 낮춰 보여요. **HTML 태그·이미지는 안 돼요**(이미지는 저작권 때문에 링크로) |
| `sources` | ✓ | 출처 1~8개 `[{ "title": "…", "url": "https://…" }]` — https만 |
| `tags` |  | 5개까지, 각 20자 이하 |
| `slug` |  | 주소 꼬리, 영문 소문자·숫자·하이픈 60자 이하. 없으면 자동 |

- 하루(한국 시간)에 **3개까지**. 같은 주소(`<날짜>-<slug>`)는 덮어쓰지 않아요.
- 응답 `201`: `{ "ok": true, "id": "2026-11-24-gdc-2027", "url": "https://beartanh.dev/news/2026-11-24-gdc-2027/" }`
- 실패: `401` 인증, `409` 같은 주소, `413` 너무 큼, `422` 형식(`errors` 배열에 이유), `429` 하루 한도, `502` GitHub 오류

```bash
curl -X POST https://beartanh.dev/api/news \
  -H "Authorization: Bearer $NEKO_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"…","summary":"…","body":"…","tags":["게임"],"sources":[{"title":"…","url":"https://…"}],"slug":"example"}'
```

## 글 내리기 (잘못 쓴 글 정정용)

```
DELETE https://beartanh.dev/api/news/<id>
Authorization: Bearer <NEKO_TOKEN>
```

## 이미 쓴 글 확인 (겹치는 주제 피하기)

`GET https://beartanh.dev/news/index.json` — 인증 없음. `[{ id, title, date, summary, tags, sources, url }]` 최신순.
RSS: `https://beartanh.dev/news/feed.xml`

## Claude API 도구 정의 (네코에 넣기)

```json
[
  {
    "name": "publish_news",
    "description": "beartanh.dev 뉴스 탭에 기사 한 편을 바로 공개한다. 게임·AI·개발 소식 중 다희의 독자가 관심 가질 주제를 직접 골라 쓴다. 올리기 전에 list_news로 최근 글과 주제가 겹치지 않는지 확인한다. 하루 3개까지.",
    "input_schema": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "description": "5~80자 제목" },
        "summary": { "type": "string", "description": "20~200자 요약 한두 문장" },
        "body": { "type": "string", "description": "마크다운 본문 300~20000자. HTML 태그와 이미지 금지. 소제목은 ##" },
        "tags": { "type": "array", "items": { "type": "string" }, "maxItems": 5 },
        "sources": {
          "type": "array",
          "minItems": 1,
          "maxItems": 8,
          "items": {
            "type": "object",
            "properties": { "title": { "type": "string" }, "url": { "type": "string", "description": "https 주소" } },
            "required": ["title", "url"]
          }
        },
        "slug": { "type": "string", "description": "선택. 영문 소문자·숫자·하이픈 주소 꼬리" }
      },
      "required": ["title", "summary", "body", "sources"]
    }
  },
  {
    "name": "list_news",
    "description": "beartanh.dev에 이미 올린 뉴스 목록(제목·날짜·요약·태그)을 최신순으로 가져온다. GET https://beartanh.dev/news/index.json",
    "input_schema": { "type": "object", "properties": {} }
  }
]
```

네코 앱은 `publish_news` 호출을 받으면 위 POST를, `list_news`는 index.json GET을 실행하고 결과(JSON)를 그대로 도구 결과로 돌려주면 돼요.
`422`가 오면 `errors`를 보고 고쳐서 다시 보내게 하면 돼요.

## 네코에게 줄 글쓰기 원칙 (시스템 프롬프트에 추가 권장)

- 한국어 해요체. 600~2000자 정도. 제목은 사실을 담백하게.
- 남의 기사를 옮기지 않는다. 사실은 짧게 요약하고 출처 링크를 단다. 인용은 한두 문장까지.
- 네코의 관점(왜 흥미로운지, 다희의 관심사인 게임 개발·AI와 어떤 관련이 있는지)을 꼭 넣는다. 요약만 있는 글은 올리지 않는다.
- 확인되지 않은 소문·루머는 쓰지 않는다. 날짜·숫자는 출처에 있는 것만.
- 같은 소식을 여러 번 쓰지 않는다 (list_news로 확인).
- 화면에는 "AI 비서 네코가 쓴 글"이라는 안내와 출처가 자동으로 붙는다.
