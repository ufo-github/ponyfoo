# Pony Foo

> Open-source blogging platform

## Development

Merely install dependencies and run the application using `npm start`. The `start` command will compile and bundle all necessary assets, set up file watchers, as well as `nodemon` and `browser-sync` so that you’re able to continuously develop.

```shell
npm install
npm start
```

## Deployments

First off you’ll need to download and install the `awscli` tool.

```shell
pip install awscli
```

Then configure it with your AWS credentials. Make sure to leave the default JSON format output as-is, the deployment scripts revolve around using `jq` to parse the `awscli` output.

```shell
aws configure
```

You’ll probably want to create an instance on EC2. The command below will spin up a new instance, give it an IP address, and set it up for `node` and `nginx`. Note that the database server must be hosted separately. For this purpose I chose [MongoLab][3] as my DBaaS provider of choice, the free tier should suffice.

```shell
npm run launch
```

Configure it with it’s private environment variables, which you should place in an `.env` file in the application root. The command below will push the `.env` file via `rsync` to the server and **restart** it, so make sure you only update environment variables when necessary.

```shell
npm run configure
```

Whenever you want to deploy, use the command below. It’ll bump the version by a single `patch` digit and upload the diff since the last deployment. Uploading occurs via `rsync`, then `nginx` and `node` are hot-reloaded thanks to `forever` and `recluster`.

```shell
npm run deploy
```

You can then quickly access the deployed site on your favorite browser.

```shell
npm run open
```

If you run into trouble, you can `ssh` into the instance and ammend the situation by yourself.

```shell
npm run ssh
```

## Usage

To access the production site visit [ponyfoo.com][4], or use `curl` to get a plaintext edition.

```shell
curl -L -H "Accept: text/plain" ponyfoo.com/articles/last
```

## License

MIT

  [3]: http://mongolab.com/
  [4]: https://github.com/ponyfoo/ponyfoo
