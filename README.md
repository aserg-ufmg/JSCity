# JSCity
   JSCity is an implementation of the Code City metaphor for visualizing source code. We adapted and implemented this metaphor for JavaScript, using the three.js 3D library.
   JSCity represents a JavaScript program as a city; folders are districts and files are sub-districts; the buildings are functions; inner functions are represented as buildings on the top of their nested function/building.
   The Number Of Lines of Source (LOC) represents the height of the buildings/functions; the Number Of Variables (NOV) in a function correlates to the building's base size. Blue buildings denote named functions; green buildings are anonymous functions.

### Examples ###

For examples of cities check: [Wiki](https://github.com/ASERG-UFMG/JSCity/wiki/JSCITY).

### About ###

JSCity is an outcome of research conducted in the [Applied Software Engineering Research Group](http://aserg.labsoft.dcc.ufmg.br/), at Federal University of Minas Gerais, Brazil



### Steps to see your first 3D Javascript City.
* Install nodejs. You can download it from [https://nodejs.org/en/](https://nodejs.org/en/).
* Install MySQL Server (https://dev.mysql.com/downloads/mysql/). If you already have the mysql on your computer jump to step * Start the MySQL server.
* Run the script **schema.sql** located inside of sql diretory.
   - The schema.sql creates a database called jscity
   - The schema.sql comes with a sample of data city

* Setup the config.json, located inside of js directory, if necessary. This file is already set up with the sample below and if you prefer you can use it.
```
"host": "localhost",
"user": "jscity"
"password": "",
"database": "jscity"
```
* Open nodeJs console and go to the js directory from JSCity.
```sh
cd /path-to-jscity-directory/js
```
* Start the application server using the command.
```sh
node server.js
```
* Using your browser, access the url below to open the jscity system:
```
http://localhost:8888/
```
* Select the system from the combobox and wait for the end of city design.


### Vagrant setup

Alternatively, you can install [Vagrant](https://www.vagrantup.com).  There is
a Vagrantfile and shell provision script, which will start up an Ubuntu 14.04
virtual machine instance, install MySQL and Node in it and configure them
properly. You can then run:

* File [vagrantfile](https://github.com/aserg-ufmg/JSCity/blob/master/Vagrantfile)

* Instructions [provision_script.sh](https://github.com/aserg-ufmg/JSCity/blob/master/provision_script.sh)

```sh
vagrant up
```

* Use your browser access the url below to open the jscity system:
```
http://localhost:8080/
```
Note that this is a different URL than the source default above.

### How to generate a city

* Certify that you have [nodejs](https://nodejs.org/en/) and [MySQL server](https://dev.mysql.com/downloads/mysql/) installed on your computer.
* Unpack your desired project and take a note of the path to access it. For this sample let's imagine that my desired project is placed  inside the following path:
```
path-to-jscity-directory/js/backend/system/
```
* Make sure the generator.js file is placed inside your project directory. e.g: 
```sh
path-to-jscity-directory/js/backend/system/name-of-your-project/
```
* Check the lib folder and config.json file are in your project's parent directory. e.g.:
```sh
path-to-jscity-directory/js/backend/system/
```
* There should also be a copy of config.json in the js directory:
```sh
path-to-jscity-directory/js
```
* Make sure that your MySQL server is started.  If it isn't, start the MySQL server.
* Open nodeJs console and go to the js directory from JSCity
```sh
cd /path-to-jscity-directory/js
``` 
* Start the application server using the command:
```sh
node server.js
```
* Open **another nodejs console** and go to the directory that you placed your desired project.
```sh
cd /path-to-jscity-directory/js/backend/system/name-of-your-project/
```
* Run the **generator.js** followed by the path of your project, a parameter -c and a name to your city. The line below shows an example of how the command is supposed to be.
```sh
node generator.js path-to-project-diretory -c "Name Your Project"
```
This command reads all js files in the directory and its subdirectories and inserts all the information needed in the database to design the city. Remember to specify your project source code correct path, because some github cloned projects come with sample codes, minify libraries and other codes that don't represent the real core of the system.
```sh
node generator.js ./backend/system/name-of-your-project/src/ -c "City Name"
```
In some cases the analysed project have at the end of the file, unfinished functions that close in another file. This may be the reason of problems at the parser, causing troubles in generating data cities. In that case, you should unify the archives or use the comand bellow to ignore parser errors.
```sh
node generator.js ./backend/system/name-of-your-project/src/ -c "City Name"
```
* Wait for the end of the process.
* Use your browser to access the url below to open the jscity system:
```
http://localhost:8888/
```
* Select the system from the combobox and wait for the end of city design.

### City Controls

We've implemented two types of visualization controls. The default control is an Orbital but you can easily change to a first person control by accessing the controls menu.

##### How to use the controls

**ORBITAL**
- Click drag with left button to orbit the current view
- Click and drag right to move about the screen plane
- Use the arrow keys to move about the screen plane
- Use the centre button / mouse wheel to zoom in or zoon out

**FIRST PERSON**
- Click and drag to look
- Use W A S D or arrow keys to move
- Press space to reset city display
- Use + or - on the numeric keypad to change movement speed.
- You can see at the topbar a value of the speed movement. The higher the number of the speed movement the faster you zoom in or zoom out.
- Press * key to return to standard speed



### Libraries Used

#### node.js
- (Https://nodejs.org/)  ou  https://github.com/joyent/node
- Version used: 0.12.3
- Suggested Version: 0.12.3
- Allows Javascript execution in command line

#### nodemon
- Https://www.npmjs.com/package/nodemon | https://github.com/remy/nodemon
- Version used: 1.3.7
- Suggested version: Later
- Resumes one node.js script file to automatically be changed.

#### forever
- Https://www.npmjs.com/package/forever | https://github.com/nodejitsu/forever
- Version used: 0.14.1
- Suggested version: Later
- Maintains a continuous process operation. In this case, a failure can shut down the server, the forever restarts.

#### mime
- Https://www.npmjs.com/package/mime | https://github.com/broofa/node-mime
- Version used: 1.3.4
- Suggested version: 1.3.n latest
- Used to detect the file type as defined by IANA to send the HTTP Content-Type header
- http://www.iana.org/assignments/media-types/media-types.xhtml

#### mysql
- Https://www.npmjs.com/package/mysql | https://github.com/felixge/node-mysql
- Version used: 2.6.2
- Suggested version: 2.6.n latest
- One of the "drivers" MySQL for node.js

#### nomnom
- Https://www.npmjs.com/package/nomnom | https://github.com/harthur/nomnom
- Version used: 1.8.1
- Suggested version: 1.8.n latest
- Library to process arguments in command line

#### esprima
- Http://esprima.org/ | https://github.com/ariya/esprima
- Version used: 2.2.0
- Suggested Version: 2.2.0
- Generator AST

#### three.js
- Http://threejs.org/ | https://github.com/mrdoob/three.js
- Version used: R71 (https://cdnjs.com/libraries/three.js)
- Suggested Version: R71
- Framework 3D

#### stats.js
- Https://github.com/mrdoob/stats.js
- Version used:
- Suggested version:
- Performance Meter same author Three.js

#### mootools
- Http://mootools.net/ | https://github.com/mootools/mootools-core
- Version used: 1.5.1
- Suggested version: 1.5.n latest
- Framework Object Oriented and cross-browser
