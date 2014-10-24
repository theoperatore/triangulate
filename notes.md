Need to keep track of:

- hawk id
- mark lat lng
- mark azimuths
- date/time of mark/azimuth
- most recently calculated diameter

Updates to be made:

- interface
	- less buttons
	- more automation
	- bottom buttons of find / export / toggle watch?
- code
	- clean up code
	- reflect data model
	- functionality


Remember when creating the data model to either not use localstorage and rely solely on Firebase, or both. Think about what happens when a user deletes a mark, a bird?, a diameter

Future expansions:

- Snapshot Mode
	- allow anyone to view the saved data as if they were just capturing it themselves. 
	- can interact with the map
	- cannot edit/update data
