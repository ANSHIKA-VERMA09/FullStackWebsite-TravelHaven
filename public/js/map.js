          mapboxgl.accessToken = mapToken;

            // Parse coordinates and handle empty case
            let coordinates =  "<%- JSON.stringify(listing.geometry.coordinates) %>";
            if (!coordinates || coordinates.length === 0) {
              // Default to coordinates for Bangalore (77.5946, 12.9716) if empty
              coordinates = [77.5946, 12.9716];
            }
            
            console.log("Coordinates:", coordinates);
            
            const map = new mapboxgl.Map({
              container: 'map',
              style: 'mapbox://styles/mapbox/streets-v12',
              center: [77.5946, 12.9716] ,
              zoom: 9
            });
            
            const marker = new mapboxgl.Marker({ color: "red" })
              .setLngLat(coordinates)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                  "<p>Exact Location provided after booking</p>"
                )
              )
              .addTo(map);
       
