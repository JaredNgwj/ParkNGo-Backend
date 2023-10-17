# Setting up backend

### Dependencies

Install NodeJS v18, it wil come with npm v9.

Install Docker, which comes with docker-compose, we'll use that to host mongodb on our local machine.

Install the mongodb for vscode extension to connect easily to mongodb directly from VScode.

### Set up

If setting up for the first time, change the terminal location to the Backend folder and run `npm install` to install all the dependencies for the app, and then run `docker compose up -d` to install the mongodb container to host the database locally.

To ensure the database is running properly, open the docker dashboard, and under the "Containers" tab there should be one named "db-mongodb". If the status is not "Running", press the play button to start the container.
The database can then be connected to using the mongodb extension, with the username and password as `root`.

To try running the server, run `node index.js`, and if theres no errors there should be a message saying `Server running on http://localhost:3000/`. If you visit http://localhost:3000/, it should say "Hello world".

To close everything, just end the process on the terminal using ctrl+c, and stop the container in docker dashboard. 

Subsequently, to run everything, just start the container and run the server.

