Triangulate (Tri-Hawk-ulate)
============================

Uses the [GoogleMaps APIv3](https://developers.google.com/maps/documentation/javascript/reference) to get the user's current GPS location for Raptor Triangulation! 

This app is being developed specifically for the [Four Lakes Wildlife Center](https://www.giveshelter.org/four-lakes-wildlife-center.html), but feel free to use the app and go nuts as tri-hawk-ulation knows no bounds...

Usage
=====

### Compatibility

This is a web app. As such, any device that is internet capable is potentially capable of using this app and all of it's features. 

However, to make sure there are no hiccups use a modern browser that supports `window.navigator` and `window.navigator.geolocation`. Most modern browsers do.

When developing I've tried to be as cross-browser compatible as possible.

### Starting up!

Just go to [the app site](http://anpetersen.me/triangulate) to access the web app! It's optimized to be used from the homescreen so adding a shortcut is a *very good idea*.

Once the app loads, if you have not been tracking a hawk, the app will prompt you for a hawk ID. 

After entering any ID, the next thing to do is use the GPS to find yourself. On the bottom of the screen are the buttons that make up the main menu. From left to right: find, save, export, new.

**Find**: Denoted by the spyglass&mdash;this button will use your device's GPS to locate and show your current postion on the map.

**Save**: Denoted by a floppy disk&mdash;this button will reflect the current state of the most recent save.

- If the icon appears red, something wrong has happened. Click on the save button and you will see the error.
- If the icon appears green, everything has been saved successfully! Way to go! 
- If the icon appears blue, a current save is in progress and the success or failure will be reflected momentarily.

**Export**: Denoted by the arrow leading away from an HDD&mdash;this button will allow you to download (as a text file) a snapshot of the data for the current session, i.e. the current hawk you are tracking.

**New**: Denoted by a plus sign&mdash;this button will open a menu with some options for different modes the app uses: track new hawk, collaborate, snapshot.

- *Track New Hawk*: resets the app to start tracking a new hawk. You will be able to enter a new HawkID upon using the "find" button again, or when attempting to save a mark.
- *Collaborate*: a feature that allows multiple users to track the same hawk in real time. **Feature currently disabled**
- *Snapshot*: this mode allows the user to either enter a sessionID or pick from a list of previous sessionIDs used on the current device to view past data. Note that the user cannot edit any saved data unless they manually select an option in the settings menu. **Feature currently disabled**

#### Notes on using the "Find" button

The app will return the first available GPS location it can find (which may not be the correct spot you are in) instead of watching for your location. As a result, just hit 'find' a couple of times until you are satisfied that the coordinates are the correct coordinates that match up with any other gps device you have.

*This was done intentionally to help conserve battery life and speed up the responsiveness of the app.*


### Saving a mark

When finished locating your coordinates, the app will place a marker on the map where it thinks you are along with a window showing the found latitude and longitude.

If you are satisfied with the location, then hit the "save" button. This will show prompts for an Azimuth heading and signal strength.

After entering relevant information, a marker will be saved in the location specified along with a line denoting your entered azimuth. The new mark will also be saved to the database automatically, so even if the app closes or you need to use a different app, as long as the save icon is green, everything is saved correctly and you need not worry about losing the mark.

If you decide that any created mark is incorrect, simply tap the mark to show a delete button that, when clicked, will delete the mark from your device. The database will automatically be updated with the change in marks. Again, as long as the save icon is green, everything is saved correctly.

### Computing a triangulation

When you save 3 or more marks, the app will automatically try to triangulate the position of the hawk based on the data provided&mdash;namely the latitude, longitude, and azimuth of each mark.

When the app finishes computing the triangulation, the result will be shown on the map. There will be a shaded blue region (bounds calculated from the intersections of the azimuth lines) with a purple circle (the largest circle possible within the shaded blue region) inside the shaded region.

The purple circle represents the error of the triangulation. To verify that the circle is as large as possible, you are encouraged to drag the circle so that each edge of the shaded blue region is touching part of the circle. 

The marker denotes the center of the circle, and if clicked shows the current coordinates of the center of the circle along with the diameter of the circle in meters.

All relevant data calculatd from the triangulation will be saved to the database automatically.

*Note that if you delete enough marks to make the total mark count less than 3, the triangulated data will be deleted from the database automatically.*

### Tracking a new hawk

When the time comes to say "good-bye" to the current hawky and "hello" to the next, hit the "New" button on the main menu at the bottom of the screen.

The modes menu will pop up allowing you to hit the button, "Track a new Hawk". This will reinitialize the app and clear all marks displayed. 

Before reinitializing however, the app will make one last save to the database just in case something was missed, or something crazy happened. If the save cannot be completed, then the app will abort reinitializing and retain the current information.

### Collaborating with a friend

### Checking your work: Snapshot Mode

### A word on database structure...

The database is organized by session. A session holds all of the data for tracking one hawk&mdash;hawkID, saved marks, triangulated info.

Any time the app asks you for a new hawkID, you are starting a new session.

This allows the database to track the same hawk multiple times and more importantly keep the app fast by only reading the relevant information from the database which will eventually be very large.

License
=======

MIT

I'd appreciate a mention though!



