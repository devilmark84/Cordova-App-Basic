Cordova App Basic
=================

Any Cordova developer needs a basic structure to use as a basis to build rich and solid apps.

This repository comes from the need to dispose of a solid infrastructure to develop Cordova Apps.

##Requirements

First of all you need to [install Cordova](http://cordova.apache.org/docs/en/edge/index.html).

Once the installation is complete, you have to [create your new project](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface).

Then you can replace the `www` directory with the one in this project.

##Single Page App

CAB is a framework that comes to make life easier for developers. You should think at CAB as a skeleton which manage for you pages transitions, pages status, app status, database interactions and more.

The `www/pages` folder contains `.html` pages. Every page is parsed before being displayed using the [Underscore Template function](http://underscorejs.org/#template) so you can render you page depending on dynamic variables (username, time, etc.).

Here are the core files:
- `app.js`: contains the initialization and utility functions for the app;
- `appui.js`: contains the UI initialization and handles the user interactions with the UI;
- 
