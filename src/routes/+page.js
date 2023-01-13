import { error } from '@sveltejs/kit';

/* This loads the data needed for the page. 
* It's called at build time on the server, and
* in the browser when you navigate to /bitmap
*/



/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {

  const fetchInfluencersData = async () => {
    try 
    { 
      const influencers = await fetch('/api/get-influencers');
      const data = await influencers.json();
      
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