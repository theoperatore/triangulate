Triangulate (Tri-Hawk-ulate)
============================

Uses the GoogleMaps api to get the user's current GPS location for Raptor Tracking!

Usage
=====

### Starting up!

Just go to [this site](anpetersen.me/triangulate) to access the web app! It's optimized to be used from the homescreen so adding a shortcut is a *very good idea*.

As of `version 0.1.34`, everything is based off of the 'find me' button. Once you hit that the app will use your device's GPS via the *navigator API* to find your location. 

It will return the first available GPS location (which may not be the correct spot you are in) so for now just hit 'find me' a couple of times until you are satisfied that the coordinates are the correct coordinates that match up with any other gps device you have.

Once the device finds any locaiton, if you are tracking a new hawk the app will ask you for the `hawkID`. This can be any identifier as long as it is unique (don't try to track two different hawks with the same ID otherwise it'll spell bad news later on down the road when exporting saved data!).

### Saving a Mark

If you are satisfied that the coordinates the app is showing you are the coordinates for the spot you are in, save them via the `Mark` button. 

A prompt will appear asking for the Azimuth of the hawk. Use a real compass for the most accurate results. Enter the degrees from 0 (being True North) that your compass reads. Since an azimuth is a heading and that heading is based off of a circle, if you input a value larger than 360 or smaller than 0, the app will automatically find the corrected direction.

`Mark` will save a variety of information including the high precision latitude and longitude of your location, and the azimuth you calculate with a compass.

### Computing a Triangulation

After finding and saving mutiple marks, it's time to `Triangulate` the points (*note that you need to have at least 3 saved marks before the app will let you triangulate*)!

Tapping `Triangulate` will calculate the azimuth-line intercepts and show the largest possible incircle based on the resulting geometry. 

Most likely, the circle will not be in the correct location for verification that it is a correct triangulation. Therefore, you are able to drag the circle to correct it's position. 

If the circle fits inside the calculated geometry, you know that the triangulation is accurate based on the given data. 

The *diameter* of the circle is given on the screen under both the current locaiton coordinates and the center of the circle coordinates. The circle *diameter* is in units of **meters**.

### Fine Tuning Marks

Sometimes, marks are not accurate: they get made accidently, you realize that the locaiton was incorrect, etc. 

If you need to delete a mark for any reason, just tap the mark on the map. A dialog window will pop up with one button: `Delete`. This will remove the marker and the azimuth line from the map and will not be used in any calculations henceforth. 

*NOTE: Deleted Markers can **NEVER** be recovered*

### Starting over

Since the app is still in it's testing phases, there isn't any way to save all of the computed triangulation data AND start tracking another hawk. 

In the interim, use the `Clear Marks` button to erase all saved marks and track again. This button deletes any saved data for the current hawk and makes the app appear as if it was being used for the first time. 

Once the app is fully functional, this button will most likely be used in conjunction with a save button to save all data for the current hawk and restart the app to track a new hawk.

### Other

`Save` doesn't do anything right now, but displays a message explaining what it will do.

`Erase Recent Mark` is left over from before tap-delete functionality was installed. It removes the most recently placed marker and azimuth line. This will get removed eventually.

Planned Updates
===============

- Expose settings to user:
  - initial map zoom
  - azimuth projection distance (defaults to 1609.34 meters)
  - 'find/watch' location toggle
- `Mark` button to be replaced by tapping on the map?
- `Triangulate` button to be replaced by automatic triangulation and detection of adaquate points
- `Save` and `Reset` buttons to be replaced by tapping in triangulated circle open options.
- Implement multiple hawk saving
- Implement exporting of all saved hawk data to some CSV
  - think about non-back-end handling of information.


License
=======

MIT

I'd appreciate a mention though!



