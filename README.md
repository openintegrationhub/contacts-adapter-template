# contacts-adapter-template
> Contacts Node.js adapter template for OIH platform

[![CircleCI](https://circleci.com/gh/openintegrationhub/contacts-adapter-template.svg?style=svg)](https://circleci.com/gh/openintegrationhub/contacts-adapter-template)
[![License](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](LICENSE)

This is a template for creating an OIH connector. We recommend using it as the first step of development. The adapter comes with a very a basic architecture which can be used on OIH. Just clone it and get started!

## Adapter Architecture

``` bash
├── component.json
├── Dockerfile
├── lib
│   ├── actions
│   │   └── upsertObject.js
│   ├── triggers
│   │   └── getObjects.js
│   └── utils
│       └── helpers.js
├── logo.png
├── package.json
└── test
    └── utils.test.js
```

All Node.js adapters get build by NPM `run-script` which checks the configuration in `package.json` first, then starts initialising the `node` and `npm` versions and builds them. As a next step, the dependencies get downloaded and builr. All Node.js adapters must use this dependeny:

```json
"dependencies": {
  "@openintegrationhub/ferryman": "^1.1.5"
}
```

Ferryman is the Node.js SDK of the OIH platform which main role is to make the adapter part of OIH platform and it ensures a smooth communication with the platform.

### component.json

The file acts as an adapter descriptor which is interpreted by OIH platform to gather all required information. Define the adapter's title and description here, as well as the authentication mechanism.

```json
{
  "title": "Contacts adapter template",
  "description": "OIH contacts adapter example",
  "docsUrl": "https://github.com/openintegrationhub/contacts-adapter-template",
  "buildType": "docker",
  "credentials": {
    "fields": {
      "username": {
        "label": "Your username",
        "required": true,
        "viewClass": "TextFieldView",
        "note": "Use your username in <b>Snazzy Contacts</b>",
        "placeholder": "youremail@mail.com"
      },
      "password": {
        "label": "Your password",
        "required": true,
        "viewClass": "PasswordFieldView",
        "note": "Use your password for <b>Snazzy Contacts</b>"
      }
    }
  },
  "triggers": {
    "getObjectsPolling": {
      "title": "Fetch new and updated objects",
      "main": "./lib/triggers/getObjects.js"
    }
  },
  "actions": {
    "upsertObject": {
      "title": "Upsert an object in your target application",
      "main": "./lib/actions/upsertObject.js",
    }
  }
}
```

This is the only place where the adapter's functionality gets listed, the so called **triggers** and **actions**. As a general rule, a **trigger** fetches data from an extrenal source and passes it forward. An **action** receives data, then modifies and/or sends it to an external destination. It also defines fields which the user should provide for authentication. In this example the user should provide `username` and `password`.

### Dockerfile

Your adapter should be built as a [Docker image](https://docs.docker.com/v17.09/engine/userguide/storagedriver/imagesandcontainers/). That is why this file plays a significant role in the whole process of deploying the adapter on OIH. An **important** part here is the `ENTRYPOINT` where you start your adapter. For this purpose you should have a `start` script in your `package.json` file which specifies the path to the script which runs the ferryman:

```json
  "start": "./node_modules/@openintegrationhub/ferryman/runGlobal.js"
```

> NOTE: Never use `root` as user in a Dockerfile

### lib

This directory contains sub-directories such as **actions**, **triggers**, and **utils** which were defined in `component.json` file.
The Node.js sources are in the sub-directories `lib/actions` and `lib/triggers`. The JSON schemas defining the adapter’s metadata are in the sub-directory `lib/schemas`. The `utils` directory mainly contains some helper functions which are used from **actions** and **triggers**.

## Actions and triggers
This template connector supports the following **actions** and **triggers**:

#### Triggers:
  - Get objects (```getObjects.js```)

  By default, a trigger is executed periodically in regular intervals. This one will fetch a data set from a remote endpoint, and emit one message for each data object it received. To ensure that it does not repeatedly emit the same objects in every interval, a snapshot is used. After each execution, it saves the most recent `lastUpdated` timestamp of the received objects. In the next execution, this timestamp is then used to only pass forward objects that have been updated since the last one.

#### Actions:
  - Upsert object (```upsertObject.js```)
  
  An action is executed whenever it receives data from another component in the same flow. This one takes the data it receives and sends it to a remote endpoint. As it is a `upsert` action, it dynamically decides whether to insert a new object into the target application, or to update an existing one. To do this, it checks whether the message's `metadata` contains a `recordUid`. If this is the case, it checks whether an object with that identifier is already present in its system. It this is the case it performs an update on that object, otherwise it performs an insert.


### Test

This directory consists of test files and seed data for testing purposes. Tests are not mandatory, but we highly recommend you to test the functionality before you deploy the adapter.


## Deployment

When you are ready to deploy your adapter, you should first build a [Docker image](https://docs.docker.com/v17.09/engine/userguide/storagedriver/imagesandcontainers/) of your adapter and then push it to [Dockerhub repository](https://hub.docker.com/u/openintegrationhub) of Openintegrationhub.
The first command creates the image and the second one pushes it to [Dockerhub](https://hub.docker.com/u/openintegrationhub).

```Dockefile
docker build -t openintegrationhub/[NAME] .
docker push openintegrationhub/NAME[:TAG]
```

Within the Open Integration Hub framework, the [Component Repository](https://openintegrationhub.github.io/docs/Services/ComponentRepository.html) is the place which lists all components your user can access, by referencing the docker images.


## License

Apache-2.0 © [Wice GmbH](https://wice.de/)
