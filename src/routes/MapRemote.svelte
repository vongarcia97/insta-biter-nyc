<script>
  import { remoteIndex } from './remoteStore';

  export let influencersData;

  let indexSelected;
  remoteIndex.subscribe(index => {
    indexSelected = index;
  });
  

  function changeTab(i) {
    return () => {
      // console.log('changeTab', i)
      remoteIndex.set(i);
    }
  }

  $: influencers = influencersData;
  $: index = indexSelected;
  // $: console.log('index updated via store:    ', indexSelected);
</script>

<!-- {#if influencers} -->
<div id="map-remote" class="tabs flex flex-grow mx-0 sm:mx-4">
  {#each influencers as influencer, i}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <btn class={index==i ? "tab tab-md flex-col tab-active tab-bordered flex-auto font-semibold text-sm sm:text-md h-auto pb-1" : "tab tab-md flex-col tab-bordered flex-auto text-sm sm:text-md h-auto pb-1"} on:click={changeTab(i)}>
    <div class="avatar p-2 sm:p-0">
      <div class={index==i ? "w-24 sm:w-28 rounded-full ring ring-primary ring-offset-base-200 ring-offset-2" : "w-24 rounded-full"}>
          <img alt="user-icon" src={`/api/asset/${influencer.profile_pic_url_hd}`} />
        </div>
    </div>
    {influencer.username}
  </btn>
  {/each}
</div>