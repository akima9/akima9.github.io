---
title: "ubuntu에 Node.js 설치"
toc: true
toc_label: "ubuntu에 Node.js 설치"
toc_icon: "tags"
toc_sticky: true
---
# Download Node.js
- https://nodejs.org/ko/download/ 접속
- Linux Binaries(x64)의 링크 주소 복사
- 다운로드 받을 디렉토리에서 아래 명령어 실행

    ```bash
    # wget {복사한 링크 주소}
    wget https://nodejs.org/dist/v18.13.0/node-v18.13.0-linux-x64.tar.xz
    ```

# Install Node.js
- 다운로드한 파일 압축 해제
    ```bash
    tar -xvf node-v18.13.0-linux-x64.tar.xz
    ```
- 설치할 디렉토리 생성 및 복사
    ```bash
    sudo mkdir -p /usr/local/lib/nodejs
    sudo cp -r node-v18.13.0-linux-x64 /usr/local/lib/nodejs/
    ```
- 환경변수에 Node.js 경로 설정
    ```bash
    vim ~/.profile
    
    # 하단에 추가
    export PATH=/usr/local/lib/nodejs/node-v18.13.0-linux-x64/bin:$PATH
    ```
- 환경변수 적용 및 Node.js 버전 확인
    ```bash
    . ~/.profile
    node -v
    ```