@echo off
setlocal
ECHO ##########
ECHO ##JSCITY##
ECHO ##########
ECHO.:
ECHO.:
:CONFIGURA
rem configurações
set DIR_NODE=C:\Program Files\nodejs
set DIR_GIT=C:\Program Files (x86)\Git\bin
set DIR_FILE=C:\wamp2\www\Projetos
set DIR_GER=C:\wamp2\www\jscyte\js\backend

:INICIALIZA
rem Adiciona git e node ao PATH
set PATH=%PATH%;%DIR_NODE%;%DIR_GIT%

rem conveniência: grava diretório original
set BDIR=%CD%

:PROJETOS
cd /D %DIR_FILE%
ECHO.:
ECHO ## INICIANDO CLONAGEM DOS REPOSITORIOS ##
ECHO.:
:CLONE
call :clonar_repositorio https://github.com/jquery/qunit.git
call :clonar_repositorio https://github.com/visionmedia/move.js.git
call :clonar_repositorio https://github.com/adobe-webplatform/Snap.svg.git
call :clonar_repositorio https://github.com/ajaxorg/ace
call :clonar_repositorio https://github.com/angular/angular.js
call :clonar_repositorio https://github.com/avajs/ava-files.git
call :clonar_repositorio https://github.com/blueimp/jQuery-File-Upload
call :clonar_repositorio https://github.com/bower/bower
call :clonar_repositorio https://github.com/craftyjs/Crafty.git
call :clonar_repositorio https://github.com/cykod/Quintus.git
call :clonar_repositorio https://github.com/dojo/dojo.git
call :clonar_repositorio https://github.com/driftyco/ionic
call :clonar_repositorio https://github.com/ellisonleao/clumsy-bird
call :clonar_repositorio https://github.com/emberjs/ember.js.git
call :clonar_repositorio https://github.com/expressjs/express
call :clonar_repositorio https://github.com/facebook/react
call :clonar_repositorio https://github.com/felipernb/algorithms.js
call :clonar_repositorio https://github.com/gruntjs/grunt
call :clonar_repositorio https://github.com/gulpjs/gulp
call :clonar_repositorio https://github.com/hakimel/reveal.js/
call :clonar_repositorio https://github.com/imakewebthings/deck.js
call :clonar_repositorio https://github.com/impress/impress.js
call :clonar_repositorio https://github.com/janl/mustache.js
call :clonar_repositorio https://github.com/jashkenas/backbone
call :clonar_repositorio https://github.com/jashkenas/underscore.git
call :clonar_repositorio https://github.com/jasmine/jasmine
call :clonar_repositorio https://github.com/jdan/isomer
call :clonar_repositorio https://github.com/jquery/jquery
call :clonar_repositorio https://github.com/julianshapiro/velocity.git
call :clonar_repositorio https://github.com/karma-runner/karma.git
call :clonar_repositorio https://github.com/kenwheeler/slick
call :clonar_repositorio https://github.com/Leaflet/Leaflet
call :clonar_repositorio https://github.com/leobalter/DexterJS.git
call :clonar_repositorio https://github.com/less/less.js
call :clonar_repositorio https://github.com/linkedin/dustjs.git
call :clonar_repositorio https://github.com/madrobby/zepto.git
call :clonar_repositorio https://github.com/meteor/meteor.git
call :clonar_repositorio https://github.com/mochajs/mochajs.github.io.git
call :clonar_repositorio https://github.com/Modernizr/Modernizr
call :clonar_repositorio https://github.com/mootools/mootools-core.git
call :clonar_repositorio https://github.com/mozilla/pdf.js
call :clonar_repositorio https://github.com/mrdoob/three.js/
call :clonar_repositorio https://github.com/nnnick/Chart.js
call :clonar_repositorio https://github.com/paperjs/paper.js
call :clonar_repositorio https://github.com/photonstorm/phaser.git
call :clonar_repositorio https://github.com/pixijs/pixi.js
call :clonar_repositorio https://github.com/pugjs/pug
call :clonar_repositorio https://github.com/riot/riot.git
call :clonar_repositorio https://github.com/scottjehl/Respond
call :clonar_repositorio https://github.com/select2/select2
call :clonar_repositorio https://github.com/Semantic-Org/Semantic-UI
call :clonar_repositorio https://github.com/socketio/socket.io
call :clonar_repositorio https://github.com/theintern/intern.git
call :clonar_repositorio https://github.com/TryGhost/Ghost
call :clonar_repositorio https://github.com/twbs/bootstrap
call :clonar_repositorio https://github.com/vinceallenvince/FloraJS
call :clonar_repositorio https://github.com/wagerfield/parallax
call :clonar_repositorio https://github.com/wycats/handlebars.js.git

ECHO.:
ECHO ##### FIM CLONAGEM #####
ECHO #
ECHO.:
ECHO ##### INICIANDO GERACAO DAS CIDADES#####
ECHO #
ECHO.:
:PROJETOS
cd /D %DIR_GER%
ECHO ## GERANDO CIDADE ACE
node generator.js ../../../Projetos/ace/lib/ace/ -c "ace"
ECHO ## GERANDO CIDADE ALGORITHMS
node generator.js ../../../Projetos/algorithms.js/src/ -c "algorithms.js"
ECHO ## GERANDO CIDADE ANGULAR
node generator.js ../../../Projetos/angular.js/src/ -c "angular"
ECHO ## GERANDO CIDADE BACKBONE
node generator.js ../../../Projetos/backbone/backbone.js -c "backbone"
ECHO ## GERANDO CIDADE BOOSTRAP
node generator.js ../../../Projetos/bootstrap/js/src/ -c "bootstrap"
ECHO ## GERANDO CIDADE BOWER
node generator.js ../../../Projetos/bower/lib/ -c "bower"
ECHO ## GERANDO CIDADE CHART
node generator.js ../../../Projetos/Chart.js/src/ -c "Chart.js"
ECHO ## GERANDO CIDADE CLUMSY-BIRD
node generator.js ../../../Projetos/clumsy-bird/js/ -c "clumsy-bird"
ECHO ## GERANDO CIDADE DECK
node generator.js ../../../Projetos/deck.js/core/ -c "deck.js"
ECHO ## GERANDO CIDADE EXPRESS
node generator.js ../../../Projetos/express/lib/ -c "express"
ECHO ## GERANDO CIDADE FloraJS
node generator.js ../../../Projetos/FloraJS/src/ -c "FloraJS"
ECHO ## GERANDO CIDADE GHOST
node generator.js ../../../Projetos/Ghost/core/ -c "Ghost"
ECHO ## GERANDO CIDADE GRUNT
node generator.js ../../../Projetos/grunt/lib/ -c "grunt"
ECHO ## GERANDO CIDADE GULP
node generator.js ../../../Projetos/gulp/ -c "gulp"
ECHO ## GERANDO CIDADE MODERNIZR
node generator.js ../../../Projetos/Modernizr -c "Modernizr"
ECHO ## GERANDO CIDADE IMPRESS
node generator.js ../../../Projetos/impress.js/js/ -c "impress.js"
ECHO ## GERANDO CIDADE IONIC
node generator.js ../../../Projetos/ionic/js/ -c "ionic"
ECHO ## GERANDO CIDADE ISOMER
node generator.js ../../../Projetos/isomer/js/ -c "isomer"
ECHO ## GERANDO CIDADE JASMINE
node generator.js ../../../Projetos/jasmine/src/ -c "jasmine"
ECHO ## GERANDO CIDADE JADE (PUG)
node generator.js ../../../Projetos/jade/bin/ -c "jade"
ECHO ## GERANDO CIDADE JQUERY
node generator.js ../../../Projetos/jquery/src/ -c "jquery"
ECHO ## GERANDO CIDADE JQUERY File-Upload
node generator.js ../../../Projetos/jQuery-File-Upload -c "jquery-file-upload"
ECHO ## GERANDO CIDADE Leaflet
node generator.js ../../../Projetos/Leaflet/src/ -c "Leaflet"
ECHO ## GERANDO CIDADE LESS
node generator.js ../../../Projetos/less.js/lib/ -c "less.js"
ECHO ## GERANDO CIDADE MOOTOOLS
node generator.js ../../../Projetos/mootools-core/Source/ -c "mootools-core"
ECHO ## GERANDO CIDADE MUSTACHE
node generator.js ../../../Projetos/mustache.js/mustache.js -c "mustache.js"
ECHO ## GERANDO CIDADE PAPER
node generator.js ../../../Projetos/paper.js/src/ -c "paper.js"
ECHO ## GERANDO CIDADE PARALLAX
node generator.js ../../../Projetos/parallax/source/ -c "parallax"
ECHO ## GERANDO CIDADE PDF
node generator.js ../../../Projetos/pdf.js/src/ -c "pdf.js"
ECHO ## GERANDO CIDADE PIXI
node generator.js ../../../Projetos/pixi.js/src/ -c "pixi.js"
ECHO ## GERANDO CIDADE REACT
node generator.js ../../../Projetos/react/src/ -c "react"
ECHO ## GERANDO CIDADE RESPONDE
node generator.js ../../../Projetos/Respond/src/ -c "Respond"
ECHO ## GERANDO CIDADE REVEAL
node generator.js ../../../Projetos/reveal.js/js/ -c "reveal.js"
ECHO ## GERANDO CIDADE SELECT2
node generator.js ../../../Projetos/select2/src/ -c "select2"
ECHO ## GERANDO CIDADE SEMANTIC-UI
node generator.js ../../../Projetos/Semantic-UI/src/ -c "Semantic-UI"
ECHO ## GERANDO CIDADE  SLICK
node generator.js ../../../Projetos/slick/slick/ -c "slick"
ECHO ## GERANDO CIDADE SOCKET
node generator.js ../../../Projetos/socket.io/lib/ -c "socket.io"
ECHO ## GERANDO CIDADE TREEEJS
node generator.js ../../../Projetos/three.js/src/ -c "three.js"
ECHO ## GERANDO CIDADE AVA
node generator.js ../../../Projetos/ava-files/ -c "ava.js"
ECHO ## GERANDO CIDADE DEXTERJS
node generator.js ../../../Projetos/DexterJS/src/ -c "dexter.js"
ECHO ## GERANDO CIDADE  ZEPTO
node generator.js ../../../Projetos/zepto/src/ -c "zepto.js"
ECHO ## GERANDO CIDADE  DOJO
node generator.js ../../../Projetos/dojo/ -c "dojo.js"
ECHO ## GERANDO CIDADE  UNDERSCORE
node generator.js ../../../Projetos/underscore/underscore.js -c "underscore.js"
ECHO ## GERANDO CIDADE  METEOR
node generator.js ../../../Projetos/meteor/packages/ -c "meteor.js"
ECHO ## GERANDO CIDADE RIOT
node generator.js ../../../Projetos/riot/lib/ -c "riot.js"
ECHO ## GERANDO CIDADE VELOCITY
node generator.js ../../../Projetos/velocity.js/velocity.js -c "velocity.js"
ECHO ## GERANDO CIDADE DUSTJS
node generator.js ../../../Projetos/dustjs/ -c "dustjs.js"
ECHO ## GERANDO CIDADE EMBER
node generator.js ../../../Projetos/ember.js/ -c "ember.js"
ECHO ## GERANDO CIDADE MOVE
node generator.js ../../../Projetos/move.js/move.js -c "move.js"
ECHO ## GERANDO CIDADE SNAP
node generator.js ../../../Projetos/Snap.svg/src/ -c "snap.js"
ECHO ## GERANDO CIDADE CRAFTY
node generator.js ../../../Projetos/Crafty/src/ -c "crafty.js"
ECHO ## GERANDO CIDADE PHASER
node generator.js ../../../Projetos/phaser/src/ -c "phaser.js"
ECHO ## GERANDO CIDADE HANDLEBARS VERIFICAR DIREITO
node generator.js ../../../Projetos/handlebars.js/src/ -c "handlebars.js"
ECHO ## GERANDO CIDADE QUINTUS
node generator.js ../../../Projetos/Quintus/lib/ -c "quintus.js"
ECHO ## GERANDO CIDADE QUNIT
node generator.js ../../../Projetos/qunit/src/ -c "qunit.js"
ECHO ## GERANDO CIDADE KARMA
node generator.js ../../../Projetos/karma.js/lib/ -c "karma.js"
ECHO ## GERANDO CIDADE INTERN
node generator.js ../../../Projetos/intern.js/lib/ -c "intern.js"
ECHO ## GERANDO CIDADE MOCHAJS
node generator.js ../../../Projetos/mochajs.github.io/js/ -c "mochajs.js"
ECHO ##### FIM GERACAO DAS CIDADES #####
ECHO #
ECHO ##### ACESSE http://localhost:8888/ para ver as cidades #####
ECHO #FIM
:FIM
cd /D "%BDIR%"
::--------------------------------------------------------
::-- Function section starts below here
::--------------------------------------------------------
:clonar_repositorio
call git clone %~1
call :rand 30 40
echo waiting %RAND_NUM% seconds
call sleep %RAND_NUM%
goto:eof

:rand
SET /A RAND_NUM=%RANDOM% * (%2 - %1 + 1) / 32768 + %1
goto:EOF


