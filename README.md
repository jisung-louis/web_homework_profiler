# Node.js Profiler

이 프로젝트는 Node.js를 사용하여 구축된 프로파일러 프로그램입니다. 사용자가 데이터 파일을 업로드하고, 각 데이터의 통계를 계산하여 시각화 결과를 보여줍니다.

## 기능
- 데이터 파일 업로드
- MIN, MAX, AVG, 표준편차 통계 계산
- 바 차트 및 라인 차트를 사용한 시각화
- 데이터베이스에서 데이터 삭제

## 설치 방법

1. 저장소를 클론합니다:
    ```bash
    git clone https://github.com/yourusername/your-repo.git
    cd your-repo
    ```

2. 필요한 패키지를 설치합니다:
    ```bash
    npm install
    ```

3. MySQL 데이터베이스 설정:
    - MySQL을 설치합니다.
    - MySQL 서버를 시작합니다:
      ```bash
      sudo service mysql start
      ```
    - MySQL 셸에 접속합니다:
      ```bash
      mysql -u root -p
      ```
      
4. `config/config.json` 파일에서 MySQL 비밀번호를 자신의 비밀번호로 변경합니다:
    ```json
    {
      "development": {
        "username": "root",
        "password": "your_mysql_password",  // 이 부분에서 본인의 비밀번호로 변경
        "database": "profilerDB",
        "host": "127.0.0.1",
        "dialect": "mysql"
      }
    }
    ```

5. 서버를 시작합니다:
    ```bash
    npm start
    ```

## 사용 방법

1. 웹 브라우저를 열고 `http://localhost:3000`으로 이동합니다.
2. 데이터 파일을 업로드합니다.
3. 통계 기준(`task` 또는 `core`)을 선택하고, 차트 유형(`bar` 또는 `line`)을 선택합니다.
4. 결과를 확인합니다.
5. 데이터베이스에서 데이터를 삭제할 수 있습니다.

## 파일 구조

- `app.js`: 메인 서버 파일.
- `db.js`: 데이터베이스 설정 및 연결.
- `public/`: 정적 파일 (CSS, JS) 저장 폴더.
- `views/`: EJS 템플릿 저장 폴더.
- `uploads/`: 업로드된 파일이 임시로 저장되는 폴더.
- `config/config.json`: 데이터베이스 연결 정보 설정 파일.

## 제작자
성결대학교 20200869 전지성  
웹 응용기술 강영명 교수님의 과제를 수행하기 위해 제작함.  
© 2024 Jisung Chun. all rights reserved. 
