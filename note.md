Dev with NodeJS
jwt.http => (using with REST Client extension) test API without Postman
- login => get token (access + refesh)
- get foods => using "Access Token"
- refeshToken => using "Refresh Token" to get "New Token"
- logout => delete token

=> life circle:
    - access token: 30s
    - refresh token: 60s

Microservices:
    npm run server_Authen -> start authen (login, regist, get token)
    npm run server_Data -> start api get data (foods)