# FrontBackDemo

Frontend and backend demo.

Initialized from my own pure JavaScript project https://github.com/EthanYangCX/HanPolyJS

Current practice: use IDEA to open back-java-sprbt

servoclienodesign

design|folder|note
-|-|-
Regular sale with RWLock in Go|`reg-rwl-go`|
Regular sale with RWLock in Java|`reg-rwl-java`|
Flash deal with Mutex in Go|`fls-mtx-go`|
Flash deal with Mutex in Java|`fls-mtx-java`|
Client, in React.JS|`client-react`|both RegSale and FlsDeal, send requests in the same time with `Promise.all()`

run of Go: 

```shell
go run helloworld.go
```

run of Java:

```shell
mvn spring-boot:run
```

- JDK installieren
  - https://unix.stackexchange.com/questions/699507/how-can-i-install-java-8-on-debian-11-bullseye
  - https://adoptium.net/
  - export PATH=$PATH:~/jdk8u345-b01/bin/
  - java -version
- Maven installer
  - https://maven.apache.org/install.html
  - wget https://dlcdn.apache.org/maven/maven-3/3.8.6/binaries/apache-maven-3.8.6-bin.tar.gz
  - tar xzvf apache-maven-3.8.6-bin.tar.gz
  - vim ~/.bashrc
  - export PATH=$PATH:~/apache-maven-3.8.6/bin/
  - source ~/.bashrc
  - mvn -v
- Go installieren (must be in /usr/local for permission)
  - https://go.dev/dl/
  - https://go.dev/doc/install
  - wget https://go.dev/dl/go1.19.linux-amd64.tar.gz
  - sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.19.linux-amd64.tar.gz
  - vim ~/.bashrc
  - export PATH=$PATH:/usr/local/go/bin
  - source ~/.bashrc
  - go version