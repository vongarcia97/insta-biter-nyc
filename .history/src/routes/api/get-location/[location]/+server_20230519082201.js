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
  // console.log(`API endpoint hit: /api/get-location/${location}`);
  // Check if the location already exists in the database
  const data = await getLocation(location);

  // If the location does not exist, fetch the data from Instagram
  if (!data || data.lat === undefined || isOlderThanFiveDays(data.last_updated)) {
    
    try {
      const response = fetch(`/api/get-location-data/${location}`);

      if (response.ok) {
        const newData = await response.json();

        // if we are not alerted of an error, return the data || else throw an error
        if (newData.alert === undefined) {
          return new Response(JSON.stringify(newData), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=86400',
            }
          });
        } else {
          throw error(500, { message: `Error fetching location data from Instagram API: ${newData.alert}`});
        }
      }
    } catch (err) {
      console.error(`Error fetching location data for ${location}: ${err}`);
      throw error(500, {err: err, message: `Error fetching location data from Instagram API for ${location}`});
    }
  }

  // If the location exists and is not old data, return the data from the database
  else {
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=100',
      }
    });
  }
}
