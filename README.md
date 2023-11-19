<h1 align="center"> :car: ParkN'Go :motorcycle:</h1>

ParkN'Go is a mobile application designed to help drivers find parking spaces effortlessly. Using real-time data from APIs, ParkN'Go provides the latest updates on available car park lots. ParkN'Go provides features such as colour-coded car park location pins on the map, detailed car park information, nearby places around the car park and navigation to desired car park location.

The demo video can be viewed here: https://youtu.be/9Cs6HPFZbsI

<h2 align = "center"> Table Of Contents </h2>

- [Prerequisites](#prerequisites) <br/>
- [Setup](#setup) <br/>
- [Tech Stack](#tech-stack) <br/>
- [Contributors](#contributors) <br/>

<h2 align="center" id = "prerequisites"> :axe:	Prerequisites</h2>

> The app works on all device types, but is optimised for IOS and IpadOS

#### Internet Connectivity Required
> Prerequsite software
* NodeJS (v18+)
  + Download from https://nodejs.org/en/
* Docker and Docker Compose CLI
  + Download docker desktop from https://www.docker.com/products/docker-desktop, it will come with Docker Compose CLI

    
> Prerequsite API Keys Required
* LTA API Key
  + Fill up the form here https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html to receive an API key

<h2 align="center" id = "setup"> :hammer_and_wrench:	Setup</h2>

>Setup

* Create a file named `.env` in the root folder of the project and copy the contents of the `.env.example` file into it, this will hold your secret API Key and database URI. The database URI has been pre-inserted for ease of use.
* Paste your private LTA API key where stated in the `.env` file.
* Open a terminal in the root folder, and run the command `npm install` to install all the dependencies.
* Using a terminal in the root folder, run the command `docker compose create` to pull the mongoDB image.
* Using a terminal in the root folder, run the command `docker compose start` to start the mongoDB container. The container can be stopped using `docker compose stop`.
* If it is the first time setting up, using a terminal in the root folder, run the command `node config/initDB.js` to initialise the database. Accept all the options by entering `1`.
* To start the server, ensure the mongoDB container is started and initialised, and then using a terminal in the root folder, run the command `node index.js`. If the server starts up successfully, `Server running on http://localhost:3000/` and `Connected to DB` will be printed on the terminal.
* Ensure the backend server is set up and running successfully before running the frontend.

<h2 align="center" id = "tech-stack"> 🛠 Tech Stack:</h2>

<div align="center">
  <h3>Frontend</h3>
  <p>
    <a href="https://skillicons.dev">
      <img src="https://skillicons.dev/icons?i=react,nodejs" height=250 width=250/>
    </a>
  </p>
  <h3>Backend</h3>
  <p>
    <a href="https://skillicons.dev">
      <img src="https://skillicons.dev/icons?i=express,docker,mongodb" height=250 width=250 />
    </a>
  </p>
  <br />
</div>

<h2 align="center" id = "contributors"> :family_man_man_boy_boy: Contributors:</h2>

<div align="center">
    <table>
        <tbody>
            <tr>
                <th>Profile</th>
                <td><a href='https://github.com/syed0059' title='Syed'> <img src='https://github.com/syed0059.png' height='50' width='50'/></a></td>
                <td><a href='https://github.com/ayyshish' title='Ashish'> <img src='https://github.com/ayyshish.png' height='50' width='50'/></a></td>
                <td><a href='https://github.com/wjkenneth' title='Kenneth'> <img src='https://github.com/wjkenneth.png' height='50' width='50'/></a></td>
                <td><a href='https://github.com/curd45' title='Param'> <img src='https://github.com/curd45.png' height='50' width='50'/></a></td>
                <td><a href='https://github.com/hiimstevenzhu' title='Steven'> <img src='https://github.com/hiimstevenzhu.png' height='50' width='50'/></a></td>
                <td><a href='https://github.com/JaredNgwj' title='Steven'> <img src='https://github.com/JaredNgwj.png' height='50' width='50'/></a></td>
            </tr>
            <tr>
                <th>Name</th>
                <td>Syed</td>
                <td>Ashish</td>
                <td>Kenneth</td>
                <td>Param</td>
                <td>Steven</td>
                <td>Jared</td>
            </tr>
        </tbody>
    </table>
</div>
