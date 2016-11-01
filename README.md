Triangulate (Tri-Hawk-ulate)
============================

current version: 0.9.0

Uses the [GoogleMaps APIv3](https://developers.google.com/maps/documentation/javascript/reference) to get the user's current GPS location for Raptor Triangulation!

People
======

Built in collaboration with **Shelby Petersen** (smpetersen.523@gmail.com) who designed, tested, and used this application for research.

This app is being developed specifically for the [Four Lakes Wildlife Center](https://www.giveshelter.org/four-lakes-wildlife-center.html), but feel free to use the app and go nuts as tri-hawk-ulation knows no bounds...

Usage
=====

### Compatibility

This is a web app. As such, any device that is internet capable is potentially capable of using this app and all of it's features. 

However, to make sure there are no hiccups use a modern browser that supports `window.navigator` and `window.navigator.geolocation`. Most modern browsers do. As long as your browser/mobile browser is [A-OK](http://caniuse.com/#feat=geolocation) you'll be fine.

When developing I've tried to be as cross-browser compatible as possible.

### Starting up!

Just go to [the app site](http://anpetersen.me/triangulate) to access the web app! It's optimized to be used from the homescreen so adding a shortcut is a *very good idea*.

Once the app loads, if you have not been tracking a hawk, the app will prompt you for a hawk ID. 

After entering any ID, the next thing to do is use the GPS to find yourself. On the bottom of the screen are the buttons that make up the Functions Menu: find and save (left to right respectively).

**Find**: Denoted by the spyglass&mdash;this button will use your device's GPS to locate and show your current postion on the map.

**Save**: Denoted by a floppy disk&mdash;this button will reflect the current state of the most recent save.

- If the icon appears red, something wrong has happened. Click on the save button and you will see the error.
- If the icon appears green, everything has been saved successfully! Way to go! 
- If the icon appears blue, a current save is in progress and the success or failure will be reflected momentarily.

There are also two buttons that make up the title bar: Hawk Menu (accessed by pressing the hawkID) and the Settings Menu (accessed by pressing the cog on the top right).

**Hawk Menu**: Shows some current session info, which affiliation the app is connected with, and a few buttons:

- *Track New Hawk*: resets the app to start tracking a new hawk. You will be able to enter a new HawkID and you'll be all set for the next hawk.
- *Collaborate*: a feature that allows multiple users to track the same hawk in real time, or view past hawk datas.

**Settings Menu**: Shows some basic information and lists available settings:

- *Enable drag marker*: this option allows the user to change the current location marker by dragging the map. 
- *Enable tap marker*: this option allows the user to change the current location marker by tapping on the map.
- *Enable GPS toggle*: this options changes the behavior of the "Find" button. Initially, "Find" will only return the quickest GPS location it recieves. Since this might not be the most accurate location, a user has to hit the "Find" button multiple times until a more accurate location is found. If this option is enabled, the "Find" button will keep trying to find the user's current position, getting more accurate as time goes on. Once a satisfactory location has been found, push the "Find" button again to stop the GPS. 

#### Notes on using the "Find" button

By default, the app will return the first available GPS location it can find (which may not be the correct spot you are in) instead of watching for your location. As a result, just hit 'find' a couple of times until you are satisfied that the coordinates are the correct coordinates that match up with any other gps device you have.

If the setting *Enable GPS toggle* is checked, then hitting the "Find" button once will start the GPS and it won't stop trying to find your location until you hit the "Find" button again to toggle the GPS off.

### Saving a mark

When finished locating your coordinates, the app will place a marker on the map where it thinks you are along with a window showing the found latitude and longitude.

If you are satisfied with the location, then hit the "save" button. This will show prompts for an Azimuth heading and signal strength.

After entering relevant information, a marker will be saved in the location specified along with a line denoting your entered azimuth. The new mark will also be saved to the database automatically, so even if the app closes or you need to use a different app, as long as you can see the marker and line on the map, everything is saved correctly and you need not worry about losing the mark.

If you decide that any created mark is incorrect, simply tap the mark to show a delete button that, when clicked, will delete the mark from your device. The database will automatically be updated with the change in marks.

### Computing a triangulation

When you save 3 or more marks, the app will automatically try to triangulate the position of the hawk based on the data provided&mdash;namely the latitude, longitude, and azimuth of each mark.

When the app finishes computing the triangulation, the result will be shown on the map. There will be a shaded blue region (bounds calculated from the intersections of the azimuth lines) with a purple circle (the largest circle possible within the shaded blue region) inside the shaded region.

The purple circle represents the error of the triangulation. To verify that the circle is as large as possible, you are encouraged to drag the circle so that each edge of the shaded blue region is touching part of the circle. 

The marker denotes the center of the circle, and if clicked shows the current coordinates of the center of the circle along with the diameter of the circle in meters.

All relevant data calculatd from the triangulation will be saved to the database automatically.

*Note that if you delete enough marks to make the total mark count less than 3, the triangulated data will be deleted from the database automatically.*

### Tracking a new hawk

When the time comes to say "good-bye" to the current hawky and "hello" to the next, tap on the HawkID on the top left of the app to open the Hawk Menu where you'll find a button "Track new Hawk". This will reinitialize the app and clear all marks displayed as well as perform some other under the hood stuff to make sure you're all set for tracking.

### Collaborating / Viewing past sessions

Let's face it, sometimes tracking a hawk by your lonesome is ROUGH BUSINESS. Now with the collaboration mode, you'll be able to track that hawk with all (max of 50 friends because of Firebase's free account) of your friends!

To Collaborate:

1. Decide amongst yourselves who is going to start (decide by acts the most "bird-like"?).
2. Have that person "Track new Hawk" via Main Menu.
3. Enter the hawkID you want to track.
4. Once the hawkID has been entered and saved, everyone else hit "Collaborate" from the Main Menu.
5. Select the first option (verify that it matches today's date and time). hit ok.
3. Party Party because you can now track the same hawk all together!

View passt sessions:

1. see Collaboration instructions.
2. viewing past data is the same as collaborating.
3. select date of data to view.
4. hit ok.
5. Party Party because you are viewing past data!

Collaboration mode allows multiple users to add and delete data for the same hawk in real time. 

If Bill and Chet are tracking the same hawk and Bill adds a gps mark, it will also show up on Chet's device too the moment the data gets saved to the database.

If Chet decides that Bill's mark was incorrect, Chet can delete Bill's mark and it will be removed from both devices once the database responds.

To stop collaborating, simply start tracking a new hawk.

If you are in the middle of a session and somone wants to collaborate with you, perfect! Send them the date and time so they can find your data. Your data will instantly appear on their device.

**NOTE:** You have full freedom to delete/add marks to the saved data. If you delete or overwrite any marks or triangulation data, the data is gone FOREVER. There isn't any way to recover the original data.

### A word on database structure...

The database is organized by session. A session holds all of the data for tracking one hawk&mdash;hawkID, saved marks, triangulated info.

Any time the app asks you for a new hawkID, you are starting a new session.

This allows the database to track the same hawk multiple times and more importantly keep the app fast by only reading the relevant information from the database which will eventually be very large.

License
=======

MIT
