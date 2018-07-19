# CatGram API

Use this API to power your very own cats-tagram! 

Check out the API documentation here:
<https://cat-gram.herokuapp.com/api-docs>

## Setting up the project in your local development machine

These instructions will get you a copy of the project up and running on your local machine for test/development purposes.

1. Clone the repo into your local machine with the following command
```
git clone https://github.com/Janesee3/cat-gram.git
```

2. Go into the project root folder, and run
```
npm install
```

3. Make sure you have mongodb installed in your machine. If not, install it with this command:
```
brew install mongodb
```

4. Create an empty folder (eg. ```/data/mongodb```) that will act as the local storage for the local mongodb instance. Next, run this command on a separate terminal to start up the local mongodb instance:
```
mongod --dbpath /data/mongodb
```

5. To start the app running on your local server with hot reload, run
```
npm start:dev
```
By default, the app can be accessed via ```localhost:3000```
