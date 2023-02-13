---
title: "DB 서버 구성하기"
categories:
  - Programming
toc: true
toc_label: "DB 서버 구성하기"
toc_icon: "tags"
toc_sticky: true
---
## MySQL 설치
### MySQL 설치 가능 버전 확인
```bash
sudo apt update
sudo apt-cache search mysql-server

# 결과 예시)
# mysql-server - MySQL database server (metapackage depending on the latest version)
# mysql-server-5.7 - MySQL database server binaries and system database setup
# mysql-server-core-5.7 - MySQL database server binaries
# default-mysql-server - MySQL database server binaries and system database setup (metapackage)
# default-mysql-server-core - MySQL database server binaries (metapackage)
# mariadb-server-10.1 - MariaDB database server binaries
# mariadb-server-core-10.1 - MariaDB database core server files
# percona-xtradb-cluster-server-5.7 - Percona XtraDB Cluster database server binaries
```

### 필요 패키지 설치
```bash
sudo apt install build-essential bison \
gcc g++ libncurses5-dev libxml2-dev openssl \
libssl-dev curl libcurl4-openssl-dev libjpeg-dev \
libpng-dev libfreetype6-dev libsasl2-dev \
autoconf libncurses5 libtirpc-dev \
libaio1 libaio-dev libnuma-dev numactl \
libc6-dev ncurses* cmake-gui cmake -y
```

### MySQL 패키지 설치
```bash
sudo apt install mysql-server-5.7 \
mysql-server-core-5.7 mysql-client-5.7 \
mysql-client-core-5.7
```

### MySQL 실행 확인
```bash
ps -ef |grep mysql
 
# 결과 예시)
# mysql    12037     1  0 02:25 ?        00:00:06 /usr/sbin/mysqld --daemonize --pid-file=/run/mysqld/mysqld.pid
```

## MySQL 접속 설정

### 접속 인증 방식 및 root 계정 패스워드 설정
```bash
# ubuntu에서 auth_socket 플러그인을 이용하여 MySQL에 접속하기 때문에 패스워드 없이 접속 가능
sudo mysql
```

```sql
-- plugin 확인
select user, host, plugin from mysql.user where User='root';

-- 패스워드 방식으로 변경 및 root 계정 패스워드 설정
UPDATE mysql.user SET plugin = 'mysql_native_password', authentication_string = PASSWORD('패스워드') WHERE User = 'root';
commit;
FLUSH PRIVILEGES;

-- 종료 
quit
```

```bash
# 접속 확인
sudo mysql -u root -p
```

### 외부 접속 가능한 계정 생성
```bash
# MySQL 접속
sudo mysql -u root -p
```

```sql
-- 계정 생성
create user '계정'@'%' identified by '패스워드';
 
-- 확인
SELECT Host, User, authentication_string From mysql.user;
```

### MySQL port 설정
```bash
# mysqld.cnf 설정 변경
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
# 아래 부분 주석 처리
#bind-address           = 127.0.0.1

# MySQL 재시작
sudo systemctl restart mysql

# 열린 포트 확인
netstat -ntlp
# 확인
# Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
# tcp6       0      0 :::3306                 :::*                    LISTEN      -
```

## 참고 사항
### DB 서버가 프라이빗 서브넷에 위치하고, iptable로 port forwarding 하는 경우
```bash
# 퍼블릭 서브넷 서버 접속
# iptables 수정
cd /etc/sysconfig
sudo vim iptables

# 아래 내용 추가
-A PREROUTING -i eth0 -p tcp -m tcp --dport {포트번호} -j DNAT --to-destination {DB서버 IP주소}:3306

#-A PREROUTING: PREROUTING 체인에 새로운 규칙을 추가한다
#-i: 입력 인터페이스
#-p: 특정 프로토콜과 매칭
#-m: 특정 모듈과의 매칭
#--dport: 목적지 port
#-j: 규칙에 맞는 패킷을 어떻게 처리할 것인지 명시
#DNAT: 외부에서 방화벽(외부IP)으로 요청되는 주소를 내부사설 IP로 변환
#--to-destination: DNAT에 의해 설정될 도착지

# iptables 설정 저장
iptables-save > iptables.save
 
# iptables
sudo systemctl restart iptables
```
