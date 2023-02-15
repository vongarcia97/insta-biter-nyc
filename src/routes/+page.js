import { error } from '@sveltejs/kit';

/* This loads the data needed for the page. 
* It's called at build time on the server
*/

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {

  const fetchInfluencersData = async () => {
    try 
    { 
      const influencers = await fetch('/api/get-influencers');
      const data = await influencers.json();
      console.log(`here's the page data: ${JSON.stringify(data)}`);
      
      return data;
    }
    catch(e)
    {
      console.error('error fetching influencers data', e);
      throw error(500, e);
    }
  };  

  return {
    influencers: await fetchInfluencersData(),
  };
}