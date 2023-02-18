---
title: "ubuntu에 FFmpeg compile 설치 (GPU 인코딩)"
categories:
  - Programming
toc: true
toc_label: "ubuntu에 FFmpeg compile 설치 (GPU 인코딩)"
toc_icon: "tags"
toc_sticky: true
---
# 디렉토리 생성
```bash
# 홈 디렉토리로 이동
cd 

# 원본 파일을 다운로드할 디렉토리 생성
mkdir ffmpeg_sources

# 파일이 빌드되고 라이브러리가 설치되는 디렉토리 생성
mkdir ffmpeg_build

# 결과 바이너리가 설치될 디렉토리 생성
mkdir bin
```

# 설치 하기
```bash
# Get the Dependencies
sudo apt-get update -qq && sudo apt-get -y install \
  autoconf \
  automake \
  build-essential \
  cmake \
  git-core \
  libass-dev \
  libfreetype6-dev \
  libgnutls28-dev \
  libmp3lame-dev \
  libsdl2-dev \
  libtool \
  libva-dev \
  libvdpau-dev \
  libvorbis-dev \
  libxcb1-dev \
  libxcb-shm0-dev \
  libxcb-xfixes0-dev \
  meson \
  ninja-build \
  pkg-config \
  texinfo \
  wget \
  yasm \
  zlib1g-dev \
  libunistring-dev \
  libc6 \
  libc6-dev \
  unzip \
  libnuma1 \
  libnuma-dev
 
# NASM
sudo apt-get -y install nasm
 
# libx264
sudo apt-get -y install libx264-dev
 
# libx265
sudo apt-get -y install libx265-dev libnuma-dev
 
# libvpx
sudo apt-get -y install libvpx-dev
 
# libfdk-acc
sudo apt-get -y install libfdk-aac-dev
 
# libopus
sudo apt-get -y install libopus-dev
 
# libsvtav1
cd ~/ffmpeg_sources && \
git -C SVT-AV1 pull 2> /dev/null || git clone https://gitlab.com/AOMediaCodec/SVT-AV1.git && \
mkdir -p SVT-AV1/build && \
cd SVT-AV1/build && \
PATH="$HOME/bin:$PATH" cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$HOME/ffmpeg_build" -DCMAKE_BUILD_TYPE=Release -DBUILD_DEC=OFF -DBUILD_SHARED_LIBS=OFF .. && \
PATH="$HOME/bin:$PATH" make && \
make install
 
# libdav1d
sudo apt-get install libdav1d-dev
 
# libvmaf
sudo apt update
sudo apt install python3 python3-pip python3-setuptools python3-wheel ninja-build doxygen
pip3 install meson
pip3 install Cython
pip3 install numpy
cd ~/ffmpeg_sources && \
wget https://github.com/Netflix/vmaf/archive/v2.1.1.tar.gz && \
tar xvf v2.1.1.tar.gz && \
mkdir -p vmaf-2.1.1/libvmaf/build &&\
cd vmaf-2.1.1/libvmaf/build && \
meson setup -Denable_tests=false -Denable_docs=false --buildtype=release --default-library=static .. --prefix "$HOME/ffmpeg_build" --bindir="$HOME/ffmpeg_build/bin" --libdir="$HOME/ffmpeg_build/lib" && \
ninja && \
ninja install
 
# ffnvcodec
cd ~/ffmpeg_sources && \
git clone https://git.videolan.org/git/ffmpeg/nv-codec-headers.git && \
cd nv-codec-headers && sudo make install
 
# cuda toolkit
sudo apt install nvidia-cuda-toolkit
 
# FFmpeg
cd ~/ffmpeg_sources && \
wget -O ffmpeg-snapshot.tar.bz2 https://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2 && \
tar xjvf ffmpeg-snapshot.tar.bz2 && \
cd ffmpeg && \
PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure \
  --prefix="$HOME/ffmpeg_build" \
  --pkg-config-flags="--static" \
  --extra-cflags="-I$HOME/ffmpeg_build/include" \
  --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
  --extra-libs="-lpthread -lm" \
  --ld="g++" \
  --bindir="$HOME/bin" \
  --enable-gpl \
  --enable-gnutls \
  --enable-libass \
  --enable-libfdk-aac \
  --enable-libfreetype \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-libsvtav1 \
  --enable-libdav1d \
  --enable-libvorbis \
  --enable-libvpx \
  --enable-libx264 \
  --enable-libx265 \
  --enable-cuda-nvcc \
  --enable-libnpp \
  --enable-libvmaf \
  --enable-nonfree && \
PATH="$HOME/bin:$PATH" make && \
make install && \
hash -r
 
source ~/.profile
```

# 실행 테스트
```bash
# GPU 사용 인코딩 명령문 예시
ffmpeg \
-fflags +genpts \
-hide_banner -re -y \
-hwaccel nvdec \
-hwaccel_device 0 \
-hwaccel_output_format cuda \
-i "{영상 Path}" \
-map 0:v:0 \
-map 0:a:0 \
-c:v h264_nvenc \
-profile:v baseline \
-x264opts no-scenecut \
-preset slow \
-crf 18 \
-g 6 \
-keyint_min 6 \
-c:a aac \
-ar 48000 \
-filter:v:0 scale_npp='iw*sar*min\(1920/\(iw*sar\)\,1080/ih\):ih*min\(1920/\(iw*sar\)\,1080/ih\)',hwdownload,pad=1920:1080:\(ow-iw\)/2:\(oh-ih\)/2,format=nv12,fps=30,hwupload -b:v:0 6M -maxrate:v:0 6M -minrate:v:0 6M -bufsize:v:0 3M -b:a:0 192k -muxdelay 0 -muxpreload 0 \
-var_stream_map "v:0,a:0" -hls_time 5 -start_number 0 -hls_list_size 0 -master_pl_name "{결과 파일명}" -hls_segment_filename {청크 파일명} {manifest 파일명}
```

# Troubleshooting
## libdav1d 설치 시 
```
ERROR: Program 'nasm' not found or not executable.

* 해결 : NASM apt-get install 로 재설치
```

## libvmaf 설치 시
```
ERROR: The value of the 'bindir' option is '/home/ubuntu/bin' which must be a subdir of the prefix '/home/ubuntu/ffmpeg_build'.

* 해결 : --bindir="$HOME/ffmpeg_build/bin" 로 수정
```

## ffmpeg 컴파일 시
```
ERROR: failed checking for nvcc.

* 해결 : sudo apt install nvidia-cuda-toolkit (cuda toolkit 설치)

ERROR: gnutls not found using pkg-config.

* 해결 : sudo apt-get install libunistring-dev
```

# References
- `https://docs.nvidia.com/video-technologies/video-codec-sdk/ffmpeg-with-nvidia-gpu/`
- `https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu`