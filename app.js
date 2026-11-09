import { GestureRecognizer, FilesetResolver }
  from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

const $ = (id) => document.getElementById(id);
const video = $("video"), overlay = $("overlay");
const startBtn = $("startBtn"), playBtn = $("playBtn");

const EMOJI = { rock: "✊", paper: "✋", scissors: "✌️" };
const MAP = { Closed_Fist: "rock", Open_Palm: "paper", Victory: "scissors" };
const NAME = { rock: "바위", paper: "보", scissors: "가위" };
const BEATS = { rock: "scissors", scissors: "paper", paper: "rock" };

const v = window.APP_VERSION || {};
$("ver").textContent = `버전: ${v.commit} · 빌드: ${v.builtAt}`;

let recognizer = null;
let current = null;      // 현재 프레임에서 인식된 손 모양
let history = [];        // 최근 프레임 기록
let playing = false;
const score = { w: 0, d: 0, l: 0 };

async function loadModel() {
  overlay.textContent = "모델 불러오는 중...";
  const files = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
  recognizer = await GestureRecognizer.createFromOptions(files, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
    },
    runningMode: "VIDEO",
    numHands: 1,
  });
}

function loop() {
  if (recognizer && video.readyState >= 2) {
    const res = recognizer.recognizeForVideo(video, performance.now());
    const g = res.gestures?.[0]?.[0];
    current = g && g.score > 0.6 ? (MAP[g.categoryName] || null) : null;
    history.push(current);
    if (history.length > 12) history.shift();
    $("live").textContent = current ? `${EMOJI[current]} ${NAME[current]}` : "-";
  }
  requestAnimationFrame(loop);
}

function mostCommon(arr) {
  const c = {};
  arr.filter(Boolean).forEach((x) => (c[x] = (c[x] || 0) + 1));
  const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function play() {
  if (playing) return;
  playing = true;
  playBtn.disabled = true;
  $("me").textContent = $("cpu").textContent = "-";
  $("result").textContent = "손 모양을 준비하세요!";
  for (const n of ["3", "2", "1"]) { overlay.textContent = n; await sleep(800); }
  overlay.textContent = "✊✋✌️";
  history = [];
  await sleep(500);
  const me = mostCommon(history);
  overlay.textContent = "";

  if (!me) {
    $("result").textContent = "손을 인식하지 못했어요. 다시 해봐요!";
  } else {
    const keys = Object.keys(EMOJI);
    const cpu = keys[Math.floor(Math.random() * 3)];
    $("me").textContent = EMOJI[me];
    $("cpu").textContent = EMOJI[cpu];
    if (me === cpu) { score.d++; $("result").textContent = "비겼어요 🤝"; }
    else if (BEATS[me] === cpu) { score.w++; $("result").textContent = "이겼어요! 🎉"; }
    else { score.l++; $("result").textContent = "졌어요 😢"; }
    $("w").textContent = score.w; $("d").textContent = score.d; $("l").textContent = score.l;
  }
  playing = false;
  playBtn.disabled = false;
}

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  try {
    await loadModel();
    overlay.textContent = "카메라 요청 중...";
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    await video.play();
    overlay.textContent = "";
    playBtn.disabled = false;
    startBtn.textContent = "카메라 켜짐";
    loop();
  } catch (e) {
    console.error(e);
    overlay.textContent = "";
    $("result").textContent = "오류: 카메라 허용 또는 네트워크를 확인해주세요.";
    startBtn.disabled = false;
  }
});

playBtn.addEventListener("click", play);
