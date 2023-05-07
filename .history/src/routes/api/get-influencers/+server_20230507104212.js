import { getInfluencers, isOlderThanThreeDays } from '$lib/server/db/firebase';
/* 
this endpoint will:
* 1. retrieve all influencers from firebase
* 2. map through each influencer and gather location IDs of latest medias
* 3. return an array of influencers and an array of location IDs
*/

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ fetch }) => {
  // console.log('endpoint hit: /api/get-influencers');
  // these locations are no longer working
  const notWorkingLocations = ['243993197', '156771374797409', '1422137628045302', '279966182', '111707264771812', '839692986', '106574191696102', '111497980393935', '1033913461', '3001373', '196445117660148', '264141897', '1804160', '829840505', '107270151795126', '213104390', '855086', '113660523761071', '2110500222299145', '592484724499480', '167952659303', '2065930323636433', '105117604220857', '214029307'];


  // initialize an array to store all of the IDs of the locations we need metadata for
  const locationIDs = [];

  // retrieve all influencers from firebase
  const influencers = await getInfluencers();

  // iterate through the array of influencers to check for outdated data
  for (let i = 0; i < influencers.length; i++) {
    // console.log('checking influencer data for:  ' + influencers[i].username);
    // check if data is old
    // const date = influencers[i].last_updated;
    const older = /* isOlderThanThreeDays(date) */ false;

    if (older) {
      // console.log('found outdated influencer data');
      const response = await fetch(`/api/get-influencer-data/${influencers[i].username}`);

      if (response.ok) {
        const data = await response.json();
        // console.log('able to retrieve new data for: ' + influencers[i].username, data);
        
        // reassign the influencer data to the new data
        influencers[i] = await data;
        
        // iterate through influencer's last visited locations and add them to locationIDs array
        influencers[i].last_visited_locations.forEach((location) => {
          if (!locationIDs.includes(location) && !notWorkingLocations.includes(location)) {
            locationIDs.push(location);
          }
        });
      } else {
        // console.log('unable to retrieve new data for: ' + influencers[i].username);
        influencers[i].last_visited_locations.forEach((location) => {
          if (!locationIDs.includes(location) && !notWorkingLocations.includes(location)) {
            locationIDs.push(location);
          }
        });
      }
    } else {
      // iterate through influencer's last visited locations and add them to locationIDs array
      influencers[i].last_visited_locations.forEach((location) => {
        if (!locationIDs.includes(location) && !notWorkingLocations.includes(location)) {
          locationIDs.push(location);
        }
      });
    }
  }

  const data = {
    influencers,
    locationIDs
  }
  
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'max-age=86400',
    }
  });
}