# contacts-adapter-template
> Contacts Node.js adapter template for OIH platform

This is a template for creating an OIH adapter which we recommend using it as the first step of the development. The adapter comes with a very a basic architecture which can be used on OIH. You can just clone it and use it.

## Adapter Architecture

``` bash
├── component.json
├── Dockerfile
├── lib
│   ├── actions
│   │   ├── deleteOrganization.js
│   │   ├── deletePerson.js
│   │   ├── upsertOrganization.js
│   │   └── upsertPerson.js
│   ├── schemas
│   │   ├── deleteOrganization.in.json
│   │   ├── deletePerson.in.json
│   │   ├── getOrganizations.out.json
│   │   ├── getPersons.out.json
│   │   ├── upsertOrganization.in.json
│   │   ├── upsertOrganization.out.json
│   │   ├── upsertPerson.in.json
│   │   └── upsertPerson.out.json
│   ├── triggers
│   │   ├── getOrganizationsPolling.js
│   │   └── getPersonsPolling.js
│   └── utils
│       ├── authentication.js
│       ├── helpers.js
│       ├── resolver.js
│       └── uids.js
├── logo.png
├── package.json
├── test
│   ├── actions.test.js
│   ├── seed
│   │   ├── actions.seed.js
│   │   ├── seed.js
│   │   ├── triggers.seed.js
│   │   └── utils.seed.js
│   ├── triggers.test.js
│   └── utils.test.js
└── verifyCredentials.js
```

All Node.js adapters for OIH  platform get build by NPM `run-script` which actually first checks the configuration in `package.json` and starts initialising the `node` and `npm` versions and build them. As a next step, the dependencies get downloaded and build. All Node.js adapters must use the following dependencies:

```json
"dependencies": {
  "elasticio-sailor-nodejs": "^2.2.0",
  "elasticio-node": "^0.0.8"
}
```

Sailor is the Node.js SDK of the OIH platform which main role is to make the adapter part of OIH platform and it ensures a smooth communication with the platform.

### component.json

The file acts as an adapter descriptor which is interpreted by OIH platform to gather all required information. For instance, you could define the adapter's title and description but the adapter's authentication mechanism as well. Here is the only place where the adapter's functionality could be listed, the so called **triggers** and **actions**. It also defines fields which the user should provide for an authentication. In this case the use should provide `username` and `password`. The whole verification process is in the `verifyCredentials.js` file.

### Dockerfile

Your adapter should be build as a [Docker image](https://docs.docker.com/v17.09/engine/userguide/storagedriver/imagesandcontainers/). That is why this file plays a significant role in the whole process of deploying the adapter on OIH. An **important** part here is the `ENTRYPOINT` where you start your adapter. For this purpose you should have a `start` script in your `package.json` file which specifies the path to the script which runs the sailor:

```json
  "start": "./node_modules/elasticio-sailor-nodejs/run.js"
```

> NOTE: Never use `root` as user in a Dockerfile

### lib

This directory contains sub-directories such as **actions**, **triggers**, **schemas** and **utils** which were already defined in `component.json` file.
The Node.js sources are in the sub-directories `lib/actions` and `lib/triggers`. The JSON schemas defining the adapter’s metadata are in the sub-directory `lib/schemas`. The `utils` directory mainly contains some helper functions which are used from **actions** and **triggers**.

### Logo

If you have a logo for your adapter, you can place a file called `logo.png` in the root directory of your adapter. In case you don't provide a logo, the generic one will be showed.

### Test

This directory consists of test files and seed data which is user for testing purposes. Tests are not required, but we recommend you to test the functionality before you deploy the adapter.

### verifyCredentials.js

This file should contain the main verification mechanism for all Node.js adapters built for OIH platform. When you create an OIH adapter you may allow users to check entered credentials for validity, during the integration flow creation. This  credentials verification is not required but it makes the flow more usable and reliable. To ensure that the platform can find and execute  the verification method make sure that:  
 - `verifyCredentials.js` must be in the **root of the folder structure**
 - `verifyCredentials.js` file is a [common.js module](http://wiki.commonjs.org/wiki/Modules/1.1)
 - it returns one function that accepts **two parameters**: credentials and cb (callback).  
 - All the credentials for verification gets passed through **credentials** parameter which is an object. This object can contain the properties that match or correspond to the account definition parameters from the `component.json`.

You can directly use the skeleton structure of `verifyCredentials.js` as a starting point to your own file.

## Deployment

When you are ready to deploy your adapter, you should first build a [Docker image](https://docs.docker.com/v17.09/engine/userguide/storagedriver/imagesandcontainers/) of your adapter and then push it to [Dockerhub repository](https://hub.docker.com/u/openintegrationhub) of Openintegrationhub.
The first command creates the image and the second one pushes it to [Dockerhub](https://hub.docker.com/u/openintegrationhub).

```Dockefile
docker build -t openintegrationhub/[NAME] .
docker push openintegrationhub/NAME[:TAG]
```


## Getting Started

This adapter example is developed and tested with [Snazzy Contacts API](https://snazzycontacts.com). If you want to build a flow using this example, you could use these test credentials when you are building the flow:

```
  username: oihtestaccount@oih.com
  password: OIHtest@

```

To run the tests locally just run `npm test`.

## Actions and triggers
This template **adapter** supports the following **actions** and **triggers**:

#### Triggers:
  - Get organizations - polling (```getOrganizationsPolling.js```)
  - Get persons - polling (```getPersonsPolling.js```)

  All triggers are of type '*polling'* which means that the **trigger** will be scheduled to execute periodically. It will fetch only these objects from the database that have been modified or created since the previous execution. Then it will emit one message per object that changes or is added since the last polling interval. For this case at the very beginning we just create an empty `snapshot` object. Later on we attach ``lastUpdated`` to it. At the end the entire object should be emitted as the message body.

#### Actions:
  - Delete organization (```deleteOrganization.js```)
  - Delete person (```deletePerson.js```)
  - Upsert organization(```upsertOrganization.js```)
  - Upsert person (```upsertPerson.js```)

## License

Apache-2.0 © [Wice GmbH](https://wice.de/)
