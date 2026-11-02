# 손 제스처 가위바위보

웹캠으로 손 모양(✊ 바위 / ✋ 보 / ✌️ 가위)을 인식해서 컴퓨터와 대결하는 웹앱입니다.
브라우저 안에서 MediaPipe Gesture Recognizer가 실행되며, 영상은 서버로 전송되지 않습니다.

## 구조

```
git push (main) → GitHub Actions → 버전 스탬프(커밋/시간) → GitHub Pages 배포
```

| 항목 | 내용 |
|---|---|
| 호스팅 | GitHub Pages |
| 자동 배포 | GitHub Actions (`.github/workflows/deploy.yml`) |
| ML | MediaPipe Gesture Recognizer (브라우저 실행) |
| 버전 표시 | 화면 하단에 배포 커밋 해시와 빌드 시각 표시 |

## 로컬 실행

```bash
python -m http.server 8000
# http://localhost:8000 접속 (카메라는 localhost 또는 https에서만 동작)
```

## 배포 방법

1. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정
2. `main`에 push하면 자동 배포
3. 주소: `https://<GitHub ID>.github.io/<저장소 이름>/`

## 자동 배포 확인

`index.html`의 문구나 `app.js`를 수정하고 push하면,
Actions 실행 후 화면 하단의 **커밋 해시와 빌드 시각**이 바뀝니다.
