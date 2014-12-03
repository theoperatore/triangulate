# Design Ideas

- cards for displaying data
  - sections are divided by sessionID
  - multiple cards per sessionID? just one per sessionID
  - each card has mark latLng, date, az, triangulation data, hawkID
  - click on a card to see relative map.
- group by hawkID
  - multiple cards per hawkID section
  - each card holds one session for specific hawkID
  - click to reveal map
- cards arranged in two columns
- controls on right side
  - download entire
  - download some
  - sortby: sessionID, hawkID
  - archive?
  - refresh
    - intercept new data and just add a badge indicating that a refresh is necessary

# Random updates to app

- figure out best way to ensure that snapshot database gets new sessionIDs.
  - currently, only 'track new hawk' saves a sessionID. 
  - make it so a sessionID is saved when a mark is saved as well
    - need to check for the existence of the snpashot id before saving?
- add spinning Nu gif as easter egg. tell shelby.
  - nu running away from link trying to net?
  - animation or interactive?
- new Database table;
  - hawkID full of sessionIDs for easy admin querying.