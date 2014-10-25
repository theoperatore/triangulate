var cvs = document.getElementById('map-canvas'),
    btnFind = document.getElementById('findMe'),
    btnSave = document.getElementById('saveMe'),
    btnDown = document.getElementById('downloadMe'),
    btnClear= document.getElementById('clearMe'),
    opts = {
      zoom   : 14,
      azDist : 4828.02
    },
    map = new google.maps.Map(
      cvs, 
      { 
        zoom : opts.zoom,
        center : new google.maps.LatLng(43.042825,-89.292592) 
      }
    ),
    version = "0.2.00";


// do a little styling quickly for our map/app
cvs.style.width = window.innerWidth + "px";
cvs.style.height = window.innerHeight - 98 + "px";


// set up event listeners
require('./find')(btnFind, map);
require('./save')(btnSave);
require('./down')(btnDown);
require('./clear')(btnClear);

// try to load today's data from database

// display saved data for today

// if no data for today, start tracking new hawk


