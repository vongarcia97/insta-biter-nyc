import { error } from '@sveltejs/kit';
import { getLocation, isOlderThanFiveDays } from '$lib/server/db/firebase';

/* THIS ENDPOINT WILL *
*
* 1. Check if the location already exists in the database
* 2. If the location does not exist, fetch the data from internal API endpoint and return it
* 3. If the location exists and is not old data, return the data from the database
*/

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, fetch }) {

  const { location } = params;
  console.log(`endpoint hit: /api/get-location/${location}`);
  // Check if the location already exists in the database
  const data = await getLocation(location);
  console.log(JSON.stringify(data));

  // If the location does not exist, fetch the data from Instagram
  if (!data || data.lat === undefined) {
    
    try {
      const response = fetch(`/api/get-location-data/${location}`);

      if (response.ok) {
        const newLocationData = await response.json();
        console.log('new location data for: ' + location);

        return new Response(JSON.stringify(newLocationData), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=120',
          }
        });
      }
    } catch (err) {
      // console.log("ERROR FETCHING NEW DATA FOR " + location + ": \n", err, "\n RETURNING OLD DATA");
      throw new error(500, err);
    }
  }

  // If the location exists and is not old data, return the data from the database
  else {
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        // 'Cache-Control': 'public, max-age=120',
      }
    });
  }
}
