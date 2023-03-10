import { error } from '@sveltejs/kit';

/* This endpoint will:
* 1. initiate a fetch request for image hosts
* 2. fetch the image from the CDN, including any needed params for access
* 3. return the image to the client as a blob
*/

/** * @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
  // console.log('request received for PUBLIC Instagram image asset', params.address);
  const { address } = params;
  
  // initiate fetch request for image. Include any needed params to for the request
  // console.log('attempting to fetch image from CDN........');
  const response = await fetch(address + url.search, {
    method: 'GET',
    headers: {
      "Access-Control-Allow-Origin": "*",
      },
    })
    .catch((e) => {
      // console.log('error fetching image from image host: ', e);
      throw error(500, e)
    });

  if (response.ok) {
    // convert response to blob before returning to client
    const blob = await response.blob();
  
    return new Response(blob, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'max-age=1200',
        },
      });
  } else {
    throw error(500, 'error fetching image from image host');
  }
}
