<script>
  import { onMount } from 'svelte';
  import MapRemote from './MapRemote.svelte';
  import BiteMap from './BiteMap.svelte';

  /** @type {import('./$types').PageData} */
  export let data;

  const influencersData = data.influencers.influencers;
  const locationsData = data.influencers.locationIDs;

  let promise = Promise.resolve([]);

  const fetchLocationsData = async () => {
    const query = '/api/get-location/';

    const locations = Promise.all(locationsData.map(async (locationID) => {
        const response = await fetch(query + `${locationID}`);

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      })
    );

    return await locations;
  }

  onMount(()=> {
    promise = fetchLocationsData();
  });
</script>

<MapRemote influencersData={influencersData}/>

{#await promise}
<div class="flex justify-center items-center h-full">
  <div class="text-center">
    <h1 class="text-2xl font-bold">Fetching data from the server... Please wait....</h1>
  </div>
</div>
{:then data}
<BiteMap locationsData={data} influencersData={influencersData}/>
{:catch error}
<h1>Error fetching data from the server. Please try to refresh your browser, or try again later.</h1>
{/await}
