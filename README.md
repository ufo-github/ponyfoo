# Pony Foo [![Build Status][1]][2]

> Open-source blogging platform

Supported Browsers: IE 10+, Chrome, Safari, Firefox

## Development

Merely install dependencies and run the application using `npm start`. The `start` command will compile and bundle all necessary assets, set up file watchers, as well as `nodemon` and `browser-sync` so that you're able to continuously develop.

```shell
npm install
npm start
```

## Deployments

First off you'll need to download and install the `awscli` tool.

```shell
pip install awscli
```

Then configure it with your AWS credentials. Make sure to leave the default JSON format output as-is.

```shell
aws configure
```

You'll probably want to create an instance on EC2. The command below will spin up a new instance, give it an IP address, and set it up for `node` and `nginx`. Note that the database server must be hosted separately. For this purpose I chose [MongoLab][3] as my DBaaS provider of choice, the free tier would typically suffice.

```shell
npm run launch
```

Configure it with it's private environment variables, which you should place in an `.env` file in the application root. The command below will push the `.env` file via `rsync` to the server and **restart** it, so make sure you only update environment variables when necessary.

```shell
npm run configure
```

Whenever you want to deploy, use the command below. It'll bump the version by a single `patch` digit and add the `'-$ENV'` string, for instance if you were working on `1.2.3`, a deployed version could become `1.2.4-staging`. Uploading occurs via `rsync`, and then `nginx` and `pm2` are hot-reloaded.

```shell
npm run deploy
```

If you run into trouble, you can `ssh` into the instance and ammend the situation by yourself.

```shell
npm run ssh
```

## License

MIT

  [1]: https://travis-ci.org/ponyfoo/ponyfoo.png?branch=master
  [2]: https://travis-ci.org/ponyfoo/ponyfoo
  [3]: http://mongolab.com/
