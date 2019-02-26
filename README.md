# Angular 6 Boilerplate Application
Frontend Angular 6 boilerplate application set up just the way I like it for rapid development and deployment of new Angular applications. 

## Application Setup
The only setup that is neccessary for this application after downloading the code is to install its dependencies. You can do this by navigating to the root directory of the project and typing the following command:

```bash
npm install
```

This command may take a few minutes to execute, and will download about 600MB of dependency code. Once it is complete, the application will be ready for use.

## Application Build Instructions

#### Webpack Dev Server
This application includes a Webpack server which will serve the files for the application from port 3000 (by default) of the host computer. To activate that server so that the application can be viewed, open a terminal and type the following command:

```bash
npm start
```

This command may take a few minutes to complete, but once it has finished, you will be able to view the application at **https://localhost:3000**.

#### Production Builds
In production, you will not use the Webpack Dev Server for the application. Instead, you can build the full application to the **dist** directory of this project using the following command:

```bash
npm run build
```

Then, you should have a webserver such as **NginX** serve the files directly from the **dist** directory.