#!/bin/bash
#
# Runs generator.js to parse a city. Meant to be run from inside the docker-compose but if you have the application configured outside of it can work as well.
# When the --debug flag is passed will start the node debugger and idle on the first line

if [[ $* == *--debug* ]]; then
	echo "Starting node debugger on port 9229"
	echo "Navigate to chrome://inspect/#devices to connect, if you do not see it there and are running this via docker make sure you remembered to map -p 9229:9229"
	node --inspect-brk=0.0.0.0:9229 ./js/backend/generator.js "$@"
else
	node ./js/backend/generator.js "$@"
fi
