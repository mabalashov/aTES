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

Default URL's:

- [Auth](http://127.0.0.1:8080/auth/)
- [Tasks](http://127.0.0.1:8080/tasks/)
- [Accounting](http://127.0.0.1:8080/accounting/)
- [Analytics](http://127.0.0.1:8080/analitics/)

Planning
---

Event Storming and application plan could be found [here](https://drive.google.com/file/d/1_xHboZXMoX8mRH-3gPrQ6qGd080JB5Nr/view?usp=sharing). Please open in diagrams.io app to find other pages

Cutting Edges
---

The following workarounds were implemented in this app.
The main aim of this app is practicing with microservice architecture, not demonstrating of clear code

- There are too much duplicate code!
- .env files with all sensitive information are committed in git
- jwt uses secret instead of keys
- some configuration is hardcoded in the code
- tyk is not used for jwt validation: jwt is parsing in each service. As an option we can use the [TYK JWT flow](https://blog.kloia.com/using-tyk-io-and-jwt-io-on-stateless-microservice-authentication-d7e6985b97bd)
  or [Traefik JWT auth](https://doc.traefik.io/traefik-enterprise/middlewares/jwt/) which is not storing the produced JWT token.
  We can configure Traefik to [invalidate](https://doc.traefik.io/traefik/middlewares/http/forwardauth/) each request with our jwt service if needed
- NestJS's default library doesn't allow adding headers to Kafka's event. So, I made a separate topic for each event
Looks like it is a restriction of [built in library](https://docs.nestjs.com/microservices/basics#publishing-events) 
- It will be better to use [Transaction Outbox](https://microservices.io/patterns/data/transactional-outbox.html) pattern 
to produce messages in Kafka, but it will take much more time to [configure](https://debezium.io/documentation/reference/1.4/configuration/outbox-event-router.html#outbox-event-router-property-route-by-field)
Kafka Connect + Debezium. We need to tune the event dispatching to make save messages in DB instead of sending strictly
in Kafka. But, I promise, I have a real experience with such scheme :)
  

Schema Registry
---

I am using [Kafka Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html)

Please run the following lines to upload schemas to Kafka cluster:

```shell
cd ./schema-registry
docker-composer up
```

Troubleshooting
---

If the scheme register container is not able to rise up, the problem could be caused by [wrong topic configuration](https://github.com/confluentinc/schema-registry/issues/698)
The hotfix is:

```shell
docker-compose run --rm ates_broker /bin/kafka-configs --zookeeper ates_zookeeper --entity-type topics --entity-name _schemas --alter --add-config cleanup.policy=compact
```


Auth
---

The JWT tokens are using in this app for AuthN.
This approach has its own pros and cons in comparison with OAuth, but it was chosen due to it is simpler to implement

