# Polkadot Events Scanner

## How to run locally:

1. First install the dependencies by running the following commands in the folder where the source code has been downloaded:

```
yarn install
yarn --cwd client install
```

2. Then copy the contents of the `.env.development` file into a new `.env.local` file.

3. Now you can run the following command:

```
yarn dev
```

This will run both the backend and frontend locally. The project uses a MongoDB database, hosted in the cloud by MongoDB Atlas.
