#!/bin/zsh
# App Store 스크린샷(문구 + 앱 화면): zsh dev/store-frames.sh <앱 화면 폴더> <저장 폴더> [언어 ...]
# <앱 화면 폴더>/<언어>/<장면>.png(앱 저장소 Scripts/Store/shots.sh 결과)를 웹사이트 카드(dev/store-frame.html)에 넣어
# <저장 폴더>/<언어>/<차례>-<장면>.png(1320×2868)로 찍습니다. 언어를 안 주면 dev/i18n.json의 모든 언어.
# 차례는 App Store에 보일 순서입니다(앞 세 장이 검색 결과에 보임).
# SIZE=medium이면 6.3인치(1206×2622, App Store Connect 필수 칸)로 찍습니다.
# DEVICE=duo면 iPhone Duo 펼친 화면(앱 저장소 DEVICE=duo shots.sh 결과)을 가로 틀에 얹어 2853×2007로 찍습니다.
set -eu
SITE=${0:A:h:h}
SHOTS=${1:?앱 화면 폴더를 주세요}
OUT=${2:?저장 폴더를 주세요}
shift 2
LANGS=(${@:-$(node -e "console.log(require('$SITE/dev/i18n.json').langs.map(l => l.code).join(' '))")})
ORDER=(first-run trips polish swipe videos quick month share room)
PORT=${PORT:-8767}
if [[ ${DEVICE:-iphone} == duo ]]; then
  WINDOW=951,669 SCALE=3 EXPECT="2853 2007 "
elif [[ ${SIZE:-large} == medium ]]; then
  # App Store Connect가 꼭 받는 칸(iPhone with Dynamic Island, medium display)
  WINDOW=402,874 SCALE=3 EXPECT="1206 2622 "
else
  WINDOW=440,956 SCALE=3 EXPECT="1320 2868 "
fi
SERVE=$(mktemp -d)
PROFILE=$(mktemp -d)
ln -s $SITE $SERVE/site
ln -s ${SHOTS:A} $SERVE/shots
python3 -m http.server $PORT --bind 127.0.0.1 --directory $SERVE >/dev/null 2>&1 &
SERVER=$!
trap "kill $SERVER 2>/dev/null; rm -rf $SERVE $PROFILE" EXIT
sleep 1
for lang in $LANGS; do
  mkdir -p $OUT/$lang
  i=1
  for scene in $ORDER; do
    [[ -f $SHOTS/$lang/$scene.png ]] || { echo "없음: $SHOTS/$lang/$scene.png"; exit 1 }
    file=$OUT/$lang/$(printf %02d $i)-$scene.png
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
      --user-data-dir=$PROFILE --force-device-scale-factor=$SCALE --virtual-time-budget=3000 \
      --window-size=$WINDOW --screenshot=$file \
      "http://127.0.0.1:$PORT/site/dev/store-frame.html?lang=$lang&scene=$scene&device=${DEVICE:-iphone}&size=${SIZE:-large}&shot=/shots/$lang/$scene.png" >/dev/null 2>&1
    size=$(sips -g pixelWidth -g pixelHeight $file | awk '/pixel/ {printf "%s ", $2}')
    [[ $size == $EXPECT ]] || { echo "크기가 다름($size): $file"; exit 1 }
    i=$((i + 1))
  done
  echo "$lang: ${#ORDER}장"
done
