#!/bin/zsh
# dev/og.html을 Chrome 헤드리스로 1200×630에 찍어 assets/og.png(공유 미리보기)를 만듭니다.
set -eu
SITE=${0:A:h:h}
PORT=${PORT:-8766}
python3 -m http.server $PORT --bind 127.0.0.1 --directory $SITE >/dev/null 2>&1 &
SERVER=$!
PROFILE=$(mktemp -d)
trap "kill $SERVER 2>/dev/null; rm -rf $PROFILE" EXIT
sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --user-data-dir=$PROFILE --force-device-scale-factor=1 --virtual-time-budget=2000 \
  --window-size=1200,630 --screenshot=$SITE/assets/og.png "http://127.0.0.1:$PORT/dev/og.html" >/dev/null 2>&1
sips -g pixelWidth -g pixelHeight $SITE/assets/og.png | tail -2
