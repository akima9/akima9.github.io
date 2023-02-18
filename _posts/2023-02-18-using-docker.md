---
title: "Mac에 Docker로 개발환경 구성하기"
categories:
  - Programming
toc: true
toc_label: "Mac에 Docker로 개발환경 구성하기"
toc_icon: "tags"
toc_sticky: true
---
# Docker Desktop 설치
`https://www.docker.com/` 접속 하여 각자 컴퓨터 사양에 맞는 docker desktop을 설치합니다.

# 디렉토리 구조 생성
```bash
# 본인이 원하는 디렉토리에 디렉토리 생성
mkdir dev
cd dev

# dev 안에 디렉토리 및 파일 생성
touch docker-compose.yml

# workspace는 Apache Document Root로 사용할 디렉토리입니다.
mkdir workspace

mkdir apache-php
cd apache-php
touch Dockerfile

```

# docker-compose.yml 파일 작성
```yml
version: "3.8"
services:
  web:
    container_name: localWebserver
    build:
      context: ./apache-php
      dockerfile: Dockerfile
    privileged: true
    ports:
      - "8000:80"
    volumes:
      - ./workspace:/pub/development
```

# Dockerfile 작성
```bash
FROM --platform=linux/amd64 centos:7
  
# Install Apache
RUN yum -y update
RUN yum -y install httpd httpd-tools
  
# Install EPEL Repo
RUN rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm \
 && rpm -Uvh http://rpms.remirepo.net/enterprise/remi-release-7.rpm
  
RUN yum -y update
  
RUN yum -y install htop mailx tmux vim lynx sshfs wget finger ntp ntpdate git
  
# Install PHP
RUN yum --enablerepo=remi-php73 -y install php php-bcmath php-cli php-common php-gd php-intl php-ldap php-mbstring \
    php-mysqlnd php-pear php-soap php-xml php-xmlrpc php-zip
  
# Install redis
RUN yum-config-manager --enable remi-php73
RUN yum -y update
RUN yum --enablerepo=remi -y install php-pecl-redis redis redis-server
RUN sed -i 's/bind 127.0.0.1/#bind 127.0.0.1/gi' /etc/redis.conf
RUN sed -i 's/protected-mode yes/protected-mode no/gi' /etc/redis.conf
  
# Update Apache Configuration
RUN search="Options Indexes FollowSymLinks MultiViews"; ret="$(sed -n "/<Directory \/>/,/<\/Directory>/s/$search/$search/p" /etc/httpd/conf/httpd.conf)"; if [ "$ret" != "$search" ]; then sed -E -i -e "/<Directory \/>/a\    $search" /etc/httpd/conf/httpd.conf; fi
RUN search="Header set Access-Control-Allow-Origin"; ret="$(sed -n "/<Directory \/>/,/<\/Directory>/s/$search/$search/p" /etc/httpd/conf/httpd.conf)"; if [ "$ret" == "$search" ]; then sed -E -i -e "/<Directory \/>/,/<\/Directory>/s/$search.*/$search \"\*\"/i" /etc/httpd/conf/httpd.conf; else sed -E -i -e "/<Directory \/>/a\    $search \"\*\"" /etc/httpd/conf/httpd.conf; fi
RUN sed -E -i -e '/<Directory \/>/,/<\/Directory>/s/AllowOverride None/AllowOverride All/i' /etc/httpd/conf/httpd.conf
RUN sed -E -i -e '/<Directory \/>/,/<\/Directory>/s/Require all denied/Require all granted/i' /etc/httpd/conf/httpd.conf
RUN sed -E -i -e '/<Directory "\/var\/www\/html">/,/<\/Directory>/s/AllowOverride None/AllowOverride All/' /etc/httpd/conf/httpd.conf
RUN sed -E -i -e 's/DirectoryIndex (.*)$/DirectoryIndex index.php \1/g' /etc/httpd/conf/httpd.conf
  
# Update PHP Configuration
RUN sed -i "s/;date.timezone =/date.timezone = Asia\/Seoul/gi" /etc/php.ini
RUN sed -i "s/error_reporting = E_ALL \& ~E_DEPRECATED \& ~E_STRICT/error_reporting = E_ALL \& ~E_NOTICE/gi" /etc/php.ini
RUN sed -i "s/display_errors = Off/display_errors = On/gi" /etc/php.ini
RUN sed -i "s/display_startup_errors = Off/display_startup_errors = On/gi" /etc/php.ini
RUN sed -i "s/short_open_tag = Off/short_open_tag = On/gi" /etc/php.ini
RUN sed -i "s/register_argc_argv = Off/register_argc_argv = On/gi" /etc/php.ini
RUN sed -i 's/;include_path = ".:\/php\/includes"/include_path = ".:..:\/pub\/development:\/php\/includes"/gi' /etc/php.ini
  
# Add /etc/httpd/conf.d/vhosts.conf
RUN set -x \
&& { \
    echo "<Directory />"; \
    echo "  Options Indexes FollowSymLinks MultiViews"; \
    echo "  AllowOverride All"; \
    echo "  Require all granted"; \
    echo "</Directory>"; \
    echo '<VirtualHost *:80>'; \
    echo '        ServerName local.gi-log.com'; \
    echo '        DocumentRoot "/pub/development/local.gi-log.com/"'; \
    echo '</VirtualHost>'; \
} > /etc/httpd/conf.d/vhosts.conf
  
RUN mkdir -p /mnt/nas
  
EXPOSE 80
  
# Start Apache
CMD ["/usr/sbin/httpd","-D","FOREGROUND"]
```

# hosts 파일 수정
```bash
vim /etc/hosts

# 아래 내용 추가
127.0.0.1   local.gi-log.com
```

# 빌드 및 실행
```bash
# dev 디렉토리로 이동
cd dev

# 빌드
docker-compose build

# 백스라운드 실행
docker-compose up -d
```

# 접속 확인
```bash
# docker 컨테이너 접속
docker exec -it localWebserver /bin/bash
```

# 로컬 페이지 접속
- 예시: local.gi-log.com:8000