import { error } from '@sveltejs/kit';
import { updateInfluencer } from '$lib/db/firebase';
/* 
this endpoint will:
* 1. initiate a fetch request to the instagram API to retrieve the influencer's data
* 3. deconstruct the response and structure data for firebase
* 4. update the influencer's data in the firebase database
* 5. return the influencer's new data
*/

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  
  const { username } = params;
  console.log(`endpoint hit: /api/get-influencer-data/${username}`);

  console.log('attempting to fetch data from instagram API........');
  // fetch user data from instagram API
  const getInfluencerData = fetch(`https://www.instagram.com/${username}/channel/?__a=1&__d=dis`, 
    {
      headers : {
        "Content-Type" : "application/json",
        "Access-Control-Allow-Origin" : "*",
      }
    })
    // convert response to json
    .then(res => res.json())
    // deconstruct the response and retrieve only the important data
    .then(data => {
      
      // conditional to check if instagram API throttled our request
      if (data.status === 'fail' && data.message === 'Please wait a few minutes before you try again.') {
        throw error(404, {
          message: data.message,
          status: data.status 
        });
      } 
      
      // conditional to check if the user is blocked due to age restrictions
      else if (data.title === 'Restricted profile') {
        throw error (500, {
          message: `${data.title}: ${data.description}`
        });
      }
      // logic to run on the data retrieved from instagram API
      else {
        console.log(`received data from instagram API for ${username}!`);
        const {
          graphql : {
            user : { 
              id,
              full_name,
              username,
              biography,
              profile_pic_url_hd,
              edge_followed_by: {
                count
              },
              edge_owner_to_timeline_media: {
                edges
              }
            }
          }
        } = data;

      // console.log('successfully deconstructed data from instagram API for getInfluencerData');

      const payload = {
        id,
        full_name,
        username,
        biography,
        profile_pic_url_hd,
        follower_count: count,
        latest_media: [...edges.filter((node) => node.node.location !== null).map((node) => {
          const container = {};
          /* node __typename possibilities: GraphVideo || GraphImage || GraphSidecar <= this is scrollable and has array of medias */
          container.post_type = node.node.__typename;
          container.post_owner = node.node.owner
          container.post_id = node.node.id;
          container.post_dimensions = node.node.dimensions;
          container.tagged_users = node.node.edge_media_to_tagged_user.edges ? node.node.edge_media_to_tagged_user.edges : null;
          container.post_location = node.node.location;
          container.post_caption = node.node.edge_media_to_caption.edges[0].node.text;
          container.post_likes = node.node.edge_liked_by.count;
          container.post_thumbnail_src = node.node.post_thumbnail_src ? node.node.post_thumbnail_src : null;
          container.post_display_url = node.node.display_url ? node.node.display_url : null;

          if (node.node.__typename === 'GraphSidecar') {
            container.sidecar_media = node.node.edge_sidecar_to_children.edges;
          }
          else if (node.node.__typename === 'GraphVideo') {
            container.video_url = node.node.video_url;
            container.video_view_count = node.node.video_view_count;
          }

          return container;
        })
        ],
        last_visited_locations: [...edges.filter((node) => {
          if (node.node.location !== null && node.node.location.has_public_page === true) {
            return node;
          }
        }).map((node) => {
          return node.node.location.id;
        })
        ]
      }
      
      return payload
    }
    })
    .catch((err) => {
      // console.log(err)
      throw error(500, {
        message: "failed to fetch data from instagram API",
        error: err
      })
    });
        
  const payload = await getInfluencerData;

  updateInfluencer(username, payload);
  
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'max-age=120',
    }
  });
}