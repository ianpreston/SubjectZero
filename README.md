# SubjectZero

SubjectZero is a web based, server side static site generator. Unlike other static site generators, SubjectZero is a node.js application that runs along side your primary web server and allows you to edit your site through a web interface.

As the name would suggest, SubjectZero is entirely an experimental idea at this point. Though I do run my own site with it, I don't particularly endorse the software nor recommend anyone else use it.

## Install

If you don't have Node.JS and MongoDB installed, you must install them first. On some distros you may be able to do this with your package manager.

    # apt-get install node mongodb

Install the lengthy list of dependencies:

    $ npm install express connect node-uuid log4js hogan mongoose ejs

Now configure SubjectZero (see below) and run the server:

    $ node main.js

## Configuration

To configure your SubjectZero, rename `config_example.json` to `config.json`. Then, open the file and modify the following options to your standards.

  `mongooseUrl`: The MongoDB database URL. If you don't know what to set this to, the default should work.

  `authUsername` and `authPassword`: Choose a user and pass for the admin panel

  `httpHost` and `httpPort`: The host and port to bind the HTTP server to

  `webRoot`: The location on your filesystem where the primary web server (say, lighttpd or nginx) will serve files from. The resulting static site that SubjectZero generates will be stored in this directory.

  `mediaUploadPath`: The location on your filesystem where media files uploaded from the web interface will be stored. This isn't a temp directory, your media files are stored there permanently. It shouldn't be web viewable, your media files will be copied into `webRoot`.

  `logFilename`: The desired path to the log file.

  `sslEnabled`: Set to `true` if you want to enable SSL for the server.

  `sslKeyFilename` and `sslCertFilename`

## Usage

## License

See the LICENSE file.