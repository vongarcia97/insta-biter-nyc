import { addOrUpdateLocation } from '$lib/server/db/firebase';

/* THIS ENDPOINT WILL: 
* 1. fetch updated location data from Instagram API
* 2. update the location data in firebase database
* 3. return the updated location data
*/

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const { locationID } = params;
  // console.log(`endpoint hit: /api/get-location-data/${locationID}`);

  // fetch location data from instagram API
  // console.log('attempting to fetch location data from instagram API');
  const getLocationData = fetch(`https://www.instagram.com/explore/locations/${locationID}/?__a=1&__d=dis`, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then(res => res.json())
    // deconstruct the response and retrieve only the important data
    .then(data => {
      // console.log(`Here is the data received from the Instagram API: ${JSON.stringify(data)}`);
      // handle invalid returns from Instagram API when too many fetch requests are made
      if (data.native_location_data !== undefined) {
        const { native_location_data: {
          location_info,
          ranked : {
            sections
          }
        } } = data;
  
        const top_posts = sections.filter((section) => section.layout_type === 'media_grid').map((section) => {
          const top_media_container = {};
  
          top_media_container.contents = section.layout_content.medias.map((media) => {
            const media_container = {};
  
            media_container.post_id = media.media.id;
            media_container.post_owner = {
              username: media.media.user.username,
              full_name: media.media.user.full_name,
            }
            media_container.post_likes = media.media.like_count,
            media_container.post_comments_count = media.media.comment_count
  
            if (media.media.media_type === 8) {
              media_container.post_type = 'GraphSidecar';
              media_container.sidecar_media = media.media.carousel_media.map((sidecar_media) => {
                const sidecar_media_container = {};
  
                if (sidecar_media.media_type === 1) {
                  sidecar_media_container.post_type = 'GraphImage';
                  sidecar_media_container.post_id = sidecar_media.id;
                  sidecar_media_container.post_display_urls = sidecar_media.image_versions2
                }
                else if (sidecar_media.media_type === 2) {
                  sidecar_media_container.post_type = 'GraphVideo';
                  sidecar_media_container.post_id = sidecar_media.id;
                  sidecar_media_container.post_thumbnail_urls = sidecar_media.image_versions2
                  sidecar_media_container.video_url_hd = sidecar_media.video_versions
                  sidecar_media_container.video_url = sidecar_media.video_versions
                }
  
                return sidecar_media_container;
              })
            } 
            else if (media.media.media_type === 2) {
              media_container.post_type = 'GraphVideo';
              media_container.post_id = media.media.id;
              media_container.post_thumbnail_url = media.media.image_versions2
              media_container.video_urls = media.media.video_versions
            }
            else if (media.media.media_type === 1) {
              media_container.post_type = 'GraphImage';
              media_container.post_id = media.media.id;
              media_container.post_display_urls = media.media.image_versions2
            }
            else if (media.media.usertags !== undefined) {
              media_container.tagged_users = media.media.usertags.in.map((tagged_user) => {
                const tagged_user_container = {};
  
                tagged_user_container.username = tagged_user.user.username;
                tagged_user_container.full_name = tagged_user.user.full_name;
                tagged_user_container.profile_pic_url = tagged_user.user.profile_pic_url;
  
  
                return tagged_user_container;
              })
            }
            else if (media.media.caption.text !== null) {
              media_container.post_caption = media.media.caption.text;
            }
            else if (media.media.comments !== null || media.media.comments !== undefined) {
              media_container.post_comments_preview = media.media.comments.map((comment) => {
              const comment_container = {};
  
              comment_container.comment_text = comment.text;
              comment_container.comment_timestamp = comment.created_at_utc;
              comment_container.comment_owner = comment.user.username;
  
              return comment_container;
            })
            }
  
            return media_container;
          })
  
          return top_media_container;
        })
  
        const {location_id, name, phone, category, lat, lng, location_address, location_city } = location_info;
  
        let has_profile = false;
        let website = null;
        let profile_data = null;
  
        if (location_info.ig_business.profile !== undefined) {
          has_profile = true;
          profile_data = {...location_info.ig_business.profile};
        } 
  
        if (location_info.website !== undefined || location_info.website !== null) {
          website = location_info.website;
        }
  
        const payload = {
          location_id,
          name,
          phone,
          category,
          lat,
          lng,
          location_address,
          location_city,
          has_profile,
          profile_data,
          website,
          top_posts,
        }
        return payload
      } else {
        const payload = {alert: 'Too many requests made to Instagram API'};
        return payload
      }
    })
    .catch(err => {
      console.error(`Error fetching location data from Instagram API: ${err}`)
    });

  const payload = await getLocationData;

  // if the data returns from the instagram API is valid, update the database and return the data
  if (payload.alert === undefined) {
    addOrUpdateLocation(locationID, payload);
  }

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=100',
    }
  });
}