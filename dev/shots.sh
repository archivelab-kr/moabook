#!/bin/zsh
# 사용: zsh dev/shots.sh <저장 폴더> [페이지 ...]   예) zsh dev/shots.sh /tmp/shots '' privacy/ support/
# 사이트를 GitHub Pages와 같은 하위 경로(/moabook/)로 띄우고, Chrome 헤드리스로
# 360 · 390 · 1280 폭(WIDTHS), 라이트 · 다크를 페이지 끝까지 찍습니다(dev/capture.mjs).
# 찍은 장면은 사이트 폴더 밖에 두고, 확인한 뒤 지웁니다.
set -eu
SITE=${0:A:h:h}
OUT=${1:?저장 폴더를 주세요}
shift
if (( $# == 0 )); then set -- '' privacy/ support/; fi
PORT=${PORT:-8765}
SERVE=$(mktemp -d)
ln -s $SITE $SERVE/moabook
python3 -m http.server $PORT --bind 127.0.0.1 --directory $SERVE >/dev/null 2>&1 &
SERVER=$!
trap "kill $SERVER 2>/dev/null; rm -rf $SERVE" EXIT
sleep 1
node $SITE/dev/capture.mjs $OUT "http://127.0.0.1:$PORT/moabook/" "$@"
