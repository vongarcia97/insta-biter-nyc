<script>
  import { onMount, onDestroy } from 'svelte';
  import MarkerPopup from './MarkerPopup.svelte';
  import { remoteIndex } from './remoteStore'
  import visited from '$lib/assets/visited-icon.svg';

  export let locationsData;
  export let influencersData;

  let indexSelected;
  let map;
  let markerLayer;

  console.log(locationsData);
  
  $: index = indexSelected;
  $: locationIDs = influencersData[index].last_visited_locations.slice();
  $: locations = locationsData.filter(location => {
    if (location.alert === undefined && locationIDs.includes(location.location_id) && location.lng !== null) {
      return location
    }
  });

  // reactive block that will invoke updateLayerLocations function when locations array is updated
  $: {
    if (map) {
      updateLayerLocations(locations);
    }
  }

  //function that will update the current map layer, when a new array of locations needs to be rendered
  const updateLayerLocations = (locations) => {
    if (!markerLayer) {
      locations.forEach((location) => createMarker(location));
    } else {
      markerLayer.clearLayers();
      locations.forEach((location) => createMarker(location));
    }
  };

  //function that creates the div elements to be plotted on the map
  function createMarker(location) {
    const name = location.name;
    const loc = [location.lat, location.lng];

		let icon = markerIcon(name);

		let marker = L.marker(loc, {icon}).addTo(markerLayer);

		bindPopup(marker, (m) => {
			let c = new MarkerPopup({
				target: m,
				props: {
					name: location.name,
          has_profile: location.has_profile || null,
          category: location.category || null,
          address: location.location_address || null,
          city: location.location_city || null,
          phone: location.phone || null,
          website: location.website || null,
          profile_data: location.profile_data || null
				}
			});
			
			return c;
		});
		
		return marker;
	}

  //function that creates Leaflet divIcon to be used as the marker icon
  function markerIcon(name) {
		let html = `<div class="map-marker"><img style="width: 50px; margin: auto;" src=${visited} /><div class="marker-text">${name}</div></div>`;
		return L.divIcon({
			html,
			className: 'map-marker'
		});
	}

  //function that will bind custom Svelte popup component to the Leaflet DOM element
	function bindPopup(marker, createFn) {
		let popupComponent;
		marker.bindPopup(() => {
			let container = L.DomUtil.create('div');
			popupComponent = createFn(container);
			return container;
		});

		marker.on('popupclose', () => {
			if(popupComponent) {
				let old = popupComponent;
				popupComponent = null;
				// Wait to destroy until after the fadeout completes.
				setTimeout(() => {
					old.$destroy();
				}, 500);

			}
		});
	}

  // createMap function that will create the map and layerGroup and return the map
  const createMap = () => {
    map = L.map('map').setView([40.745, -74.0060], 13.5);
  
    // add the OpenStreetMap tiles and attribution to map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`
    }).addTo(map);
    
    // create a marker layer group and add it to the markerLayer variable
    markerLayer = L.layerGroup().addTo(map);

    return map;
  }

  // subscribe to the remoteIndex store and assign the value to indexSelected
  const unsubscribe = remoteIndex.subscribe(index => indexSelected = index);

  onMount(() => {
    map = createMap();
    return () => {
      map.remove();
      map = null;
      markerLayer = null;

      unsubscribe();
    };
  });

</script>

<div class="mt-10 mx-3 sm:mx-2" style="background-color: black;">
  <div id="map" class="rounded-box">  
  </div>
</div>

<style>
  #map {
    min-height: 750px;
    width: 100%;
  }

  
	#map :global(.marker-text) {
    width:100%;
		font-weight:600;
		background-color:#444;
    text-align: center;
		color:#EEE;
		border-radius:0.5rem;
	}
	
	#map :global(.map-marker) {
    width: auto;
		min-width:80px;
    transform:translateX(-50%) translateY(-25%);
	}
  
  #map :global(.card) {
    width: 100%;
    position: relative;
	}

  #map :global(.leaflet-popup-content) {
    margin: 0;
	}
</style>
