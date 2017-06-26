# Ping and Status

## Overview
Each proxy source code module is self contained with the actual Apigee Edge proxy, config files for Edge Management API calls (e.g. KVMs, target servers), swagger spec and tests.
The key components enabling continuous integration are:
* Jenkins - build engine
* Maven - builder
* Apickli - cucumber extension for RESTful API testing
* Cucumber - Behavior Driven Development
* JMeter - Performance testing

Basically, everything that Jenkins does using Maven and other tools can be done locally, either directly with the tool (e.g. jslint, cucumberjs) or via Maven commands. The sections below show how to do each.

Jenkins projects are set up to run using Maven and Maven runs via configurations in a pom file (pom.xml). Maven follows a phased approach to execute commands and generally the result of that execution is to create a "target" directory to hold the output ultimately results in loading the proxy into Apigee Edge. Some commonly used commands are:
* clean - remove the target directory
* copy-resources - copy the source files to the target applying any filtering or replacement
* package - copy the source files and bundle into zip file for deployment to Apigee
* install - copy, package and install into Apigee
* integration - run integration tests

Here is the tree structure, with a little pruning for brevity:
```
.
├── README.md
├── apiproxy
│   ├── pingstatus-v1.xml
│   ├── policies
│   │   ├── AM-Set-Service-Unavailable-Error-Variables.xml
│   │   ├── AM-create-status-response.xml
│   │   ├── AM-debug.xml
│   │   ├── AM-default-proxy-fault.xml
│   │   ├── AM-missing-or-invalid-clientId.xml
│   │   ├── AM-resource-not-found.xml
│   │   ├── JS-set-time-data.xml
│   │   ├── KV-Get-Config-Values.xml
│   │   ├── RF-create-ping-response.xml
│   │   ├── RF-path-suffix-not-found.xml
│   │   └── VA-header.xml
│   ├── proxies
│   │   └── default.xml
│   ├── resources
│   │   └── jsc
│   │       └── JS-set-time-data.js
│   └── targets
│       └── default.xml
├── config.json
├── oas
│   └── pingstatus-v1-oas.json
├── package.json
├── pom.xml
└── test
    ├── apickli
    │   ├── config
    │   │   └── config.json
    │   └── features
    │       ├── errorHandling.feature
    │       ├── health.feature
    │       ├── step_definitions
    │       │   ├── apickli-gherkin.js
    │       │   ├── errorHandling.js
    │       │   ├── factory.js
    │       │   └── init.js
    │       └── support
    │           └── env.js
    └── jmeter
        ├── pingstatus.jmx
        └── pingstatus_test.csv
```

#### Tests
To see what "tags" are in the tests for cucumberjs run `grep @ *.features` or `find . -name *.feature -exec grep @ {} \;`
```
@intg
    @invalidclientid
    @invalid-clientid-for-resource
    @foo
    @foobar
@health
    @get-ping
    @get-statuses
```

### Maven
#### Jenkins Commands
The Jenkins build server runs Maven with this command for each of the feature branches. Note the use of `-Duser.name=yourname-`. That is so the build and deploy to Apigee creates a separate proxy with a separate basepath to allow independent feature development. Your proxy will show up with a name (e.g. pingstatus-yourname-v1) and basepath (e.g. /pingstatus/yourname-v1).

NOTE: The use of user.name option is important, if omitted, Maven will use your username from the system you are running on. If set to nothing (-Duser.name=) then you will be using the "standard" proxy.

```
mvn -P test clean install -Duser.name=yourname- -DtestType=@intg
```

For other environments (e.g. test, qa, uat, prod) the user.name is left blank, so the build puts the proxy into the final form with the final basepath (e.g. pingstatus-v1, /pingstatus/v1).
```
mvn -P test clean install -Duser.name= -DtestType=@intg
```

NOTE: If you get a strange error from Maven about replacement `named capturing group is missing trailing '}'` there is something wrong with your options or replacements settings.

In addition to "replacing" that string other Maven phases (e.g. process-resources) do some inline replacement to support the feature proxy.
The most important change is to the `test/apickli/config/config.json` file which changes the basepath for the proxy so the tests go to the correct feature proxy in Apigee.


## Local Install and Set Up
In each source directory there is a `package.json` file that holds the required node packages.

* Install node
* Install maven
* Install Apickli and cucumberjs
    * cd source directory
    * `npm install` (creates node_modules)
    * `npm install -g cucumberjs` (installs command line tools per OS (e.g. cucumberjs)


## Running Tests Locally
Often it is necessary to interate over tests for a feature development. Since Apickli/Cucumber tests are mostly text based, its easy to do this locally. 
Here are the steps:
1 Install your feature proxy to Apigee if you are creating a new feature, otherwise just get a copy of the exising proxy you are building tests for.
2 Run Maven to copy resources and "replace" things. 
    * `mvn -P test clean process-resources  -Duser.name=yourname- `
3 `cd target/apickli/features` directory and run tests by tag or by feature file
    * cucumberjs test/apickli/features --tags @intg
    * cucumberjs errorHandling.feature

Alternatively, you can run the tests via Maven
* `mvn -P test process-resources -Duser.name=yourname- exec:exec@integration -DtestType=@get-ping`

NOTE: the initial output from cucumber shows the proxy and basepath being used
```
    [yourname]$ cucumberjs test/apickli/features --tags @invalid-clientid-for-resource
==> pingstatus api: [yourorgname-test.apigee.net, /pingstatus/yourname-v1]
    @intg
    Feature: Error handling

      As an API consumer
      I want consistent and meaningful error responses
      So that I can handle the errors correctly

      @invalid-clientid-for-resource
      Scenario: GET with invalid clientId for resource
        Given I set clientId header to `invalidClientId`
        When I GET /ping
        Then response code should be 400
        And response header Content-Type should be application/json
        And response body path $.message should be missing or invalid clientId
```

## Other Miscellaneous Commands
#### Install and Run Tests by tag as default username (branch pingstatus-kurtv1)
* mvn -P test install -DtestType=@health,@intg

#### Install and Run Tests by tag as specified username (branch pingstatus-kurt-v1)
* mvn -P test clean install -DtestType=@health,@intg -Duser.name=yourname-

#### Install and Run Tests by tag as no username (master)
* mvn -P test clean install -DtestType=@health,@intg -Duser.name=

#### Process-resources and Run Tests by tag
* mvn -P test process-resources -Duser.name=yourname-
* mvn -P test exec:exec@integration -DtestType=@health

### JMeter
jmeter -n -l output.txt -t test/jmeter/pingstatus.jmx -DtestData=pingstatus_test.csv -DthreadNum=1 -DrampUpPeriodSecs=1 -DloopCount=-1 -Drecycle=false

### JSLint
* jslint apiproxy/resources/jsc
* mvn -P test jshint:lint
* mvn -P test jshint:lint@jslint

### Aplicki / Cucumber Standalone Tests
These will not work since config.json does not have actual default API Keys, they get replaced for every profile
* cucumberjs test/apickli/features/ping.feature
* cucumberjs test/apickli/features --tags @health
* cucumberjs test/apickli/features --tags @intg
* cucumberjs test/apickli/features --tags @intg,@health

NOTE: For some reason the latest cucumber (2.3.4) doesnt work with apickli-gherkin.js, it doesnt find it, so use 1.3.3

#### Diffing apiproxy directories
* diff -q --suppress-common-lines -r --side-by-side apiproxy-prev apiproxy -W 240
* diff --suppress-common-lines -r --side-by-side apiproxy-prev apiproxy -W 240
