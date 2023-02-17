---
title: "ubuntu에 NVM 설치"
categories:
  - Programming
toc: true
toc_label: "ubuntu에 NVM 설치"
toc_icon: "tags"
toc_sticky: true
---
# 설치 스크립트 다운로드
`https://github.com/nvm-sh/nvm`에 접속하여 `install.sh`을 다운로드 하고, 터미널을 껐다가 켭니다.
```bash
# 아래 둘 중 하나로 다운로드

# 1. curl 사용
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# 2. wget 사용
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

# NVM으로 최신 node.js 설치
```bash
# 최신 LTS 버전 설치
nvm install --lts

# 설치된 버전 확인
nvm list

# node 버전 확인
node -v
```