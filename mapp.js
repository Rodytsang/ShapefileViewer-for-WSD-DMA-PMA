/*
 * Author : Chris gor
 * Application Name: 
 * Creation Date :
 * Contributions : 
 *      1. allow Visualization of shapefile 
 * Genius : Chris gor
 * small potato : Anna and Rody
 * Technical Advisor : Chris Yip
 * -------
 * -------
 *          
 *
 */


// All the L.map() 
// create a map in the 'map' div
var map = L.map('map').setView([22.377846395558592, 114.27096591182394], 16);

display_map();

//getting openstreetmap & display on webpage
function display_map() {

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
}

function click_listener() {
    // create a File Selection Dialog Box
    var input = document.createElement('input');
    input.type = 'file';

    // handle the selected file 
    input.onchange = e => { 
        // getting a hold of the file reference
        var file = e.target.files[0]; 
       
        // setting up the reader
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);

        dbf_path = file.name.substr(0, file.name.lastIndexOf(".")) + ".dbf";  
        //reading the dbf file

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!
            
            shapefile.open(content)
                     .then(source => source.read()
                     .then((result) => {
                        // console.log(result)
                        if (result.done) return;
                        
                        log(result)
                            function log(result) {
                                if (result.done) return;
                                var new_geo_json = wgs84_to_HK80(result.value)
                                console.log(new_geo_json)
                                L.geoJSON(new_geo_json, {
                                   onEachFeature: function popUp(f, l) {
                                    var out = [];
                                        if (f.properties) {
                                            // console.log(f.propertiies)
                                            for (var key in f.properties) {
                                                out.push(key + ": " + f.properties[key]);
                                            }
                                            l.bindPopup(out.join("<br />"));
                                        }
                                    } 
                                }).addTo(map)

                                return source.read().then(log);
                            }                                    
                            
                        }))
                    .catch(error => console.error(error.stack));

           
        }
    }
    input.click();
}

// Transform geoJSON.geometry into wgs84 EPSG:3857
function wgs84_to_HK80(geojson) {
    var source_geometries = geojson.geometry.coordinates[0]
    // define the projection from HK80 to wgs84
    var hk80 = new proj4.Proj("+proj=tmerc +lat_0=22.3121333333333 +lon_0=114.178555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.243649,-1.158827,-1.094246 +units=m +no_defs");
    let wgs84_geometries = []

    source_geometries.forEach((coor) => {
        new_coor = proj4(hk80).inverse(coor)
        wgs84_geometries.push(new_coor)
    });
    
    geojson.geometry.coordinates[0] = wgs84_geometries

    return geojson
}