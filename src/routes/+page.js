import { error } from '@sveltejs/kit';

/* This loads the data needed for the page. 
* It's called at build time on the server
*/

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {

  const fetchInfluencersData = async () => {
    try { 
      const influencers = await fetch('/api/get-influencers');
      const data = await influencers.json();
      
      return data;
    } catch(err){
      console.error(`Error fetching influencers data: ${err}`);
      throw error(500, { err: err, message: 'Error fetching influencers data' });
    }
  };  

  return {
    influencers: await fetchInfluencersData(),
  };
}