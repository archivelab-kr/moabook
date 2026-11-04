# 모아북 웹사이트

사진 정리 앱 모아북(MoaBook)의 소개 · 개인정보 처리방침 · 지원 페이지입니다. 빌드 도구 없이 HTML · CSS · JS만 씁니다.

| 주소 | 파일 |
|---|---|
| `/moabook/` | `index.html` |
| `/moabook/privacy/` | `privacy/index.html` |
| `/moabook/support/` | `support/index.html` |

## 파일

- `characters.js`: 앱 픽셀 캐릭터의 사본(그림 · 색 · 표정 규칙 · 소품). 앱에서 그림이나 색을 바꾸면 여기도 손으로 맞춥니다.
- `scenes.js`: 소개 페이지의 픽셀 사진(14×11칸 풍경과 폴라로이드 틀). `characters.js`와 같은 방식으로 SVG를 그립니다.
- `site.css`: 세 페이지가 함께 쓰는 스타일, `main.js`: 캐릭터 · 픽셀 사진 그리기와 움직임
- `assets/shots/`: 실제 앱 스크린샷(iPhone 17 Pro 시뮬레이터, 자연 사진으로 채운 보관함, 9:41). 552×1200, 장당 400KB 안.
- `dev/`: 확인용 페이지(캐릭터 표 · 공유 이미지)와 스크린샷 스크립트. 다른 페이지에서 링크하지 않습니다.

## 확인

```sh
node check.mjs          # 캐릭터 규칙 · 링크 검사
zsh dev/shots.sh <폴더>  # 세 페이지를 360 · 390 · 1280 폭, 라이트 · 다크로 찍기(SEG=2000이면 나눠 찍음)
zsh dev/og.sh           # dev/og.html로 assets/og.png(공유 이미지) 다시 만들기
python3 -m http.server  # 로컬에서 열기(ES 모듈이라 file://로는 캐릭터가 안 보임)
```

외부 라이브러리 · 웹 글꼴 · 방문 통계를 쓰지 않습니다(외부 요청 0개).
