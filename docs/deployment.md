# Deployment

## 1 - Prepare a docker image container
I follow this tutorial to prepare deployment files :
(https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

Change passwords in the `.env` file :
```
TEACHER_PASSWORD=a_strong_password_here
ADMIN_PASSWORD=another_strong_password_here
```

Build the container image with
```
docker build -t cuiquiz-image .
```

## 2 - Modify the reverse proxy
When using Nginx as a reverse proxy you need to add some custom content in order to use socket.io
(https://socket.io/docs/v3/reverse-proxy/)
```
http {
  server {
    listen 80;
    server_name example.com;

    location / {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://localhost:3000;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }
}
```

## 3 - Start container
Start container image with :
```
docker run --rm --name cuiquiz-container -p 1234:3000 cuiquiz-image
```

If everything goes fine, restart the container in detached mode (-d)
