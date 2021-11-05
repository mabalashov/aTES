Homework for the course ["Асинхронная архитектура / Async architecture"](https://education.borshev.com/architecture)

Start
---

Development
```
docker network create ates_network

docker-compose up -d

cd auth
docker-compose up -d
cd ..
```

Planning
---

Event Storming and application plan could be found here:

https://drive.google.com/file/d/1_xHboZXMoX8mRH-3gPrQ6qGd080JB5Nr/view?usp=sharing

Cutting Edges
---

The following workarounds were implemented in this app.
The main aim of this app is practicing with microservice architecture, not demonstrating of clear code

- .env files with all sensitive information are committed in git
- jwt uses secret instead of keys
- some configuration is hardcoded in the code

Auth
---

The JWT tokens are using in this app for AuthN.
This approach has its own pros and cons in comparison with OAuth, but it was chosen due to it is simpler to implement
