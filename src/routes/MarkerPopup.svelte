<script>
	import telephone from '$lib/assets/telephone.png';
	import instagram from '$lib/assets/instagram.png';
	import www from '$lib/assets/www.png';
	import visited from '$lib/assets/visited-icon.svg';
	export let name, has_profile, category, address, city, phone, website, profile_data;
</script>

{#if has_profile}
<div class="card w-96" >
  <figure class="flex flex-col px-10 pt-10">
    <div class="avatar">
			<div class="w-24 mask mask-squircle">
				<img src={`/api/asset/${profile_data.profile_pic_url}`} alt="profile-pic" />
			</div>
		</div>
		<div class="flex">
			<a rel="external noreferrer" class="flex pt-2 font-semibold text-black" href={`http://instagram.com/${profile_data.username}`} target="_blank"><h3 class="pt-1">{profile_data.username}</h3>
				<img class="ml-2" src={instagram} alt="instagram-icon"/>
			</a>
		</div>
  </figure>
  <div class="card-body items-center text-center">
    <h2 class="card-title">{name}</h2>
		<h4>{category ? category : ''}</h4>
    <h4>{address ? address : ''}</h4>
		<h4>{city ? city : ''}</h4>
		{#if phone}
		<a rel="external noreferrer" class="flex font-medium" href={`tel:${phone}`} target="_blank">
			<img class="mr-2" src={telephone} alt="www-icon"/>
			<h4 class="pt-1">{phone}</h4>
		</a>
		{/if}
		{#if website}
		<div class="flex">
			<a rel="external noreferrer" class="pt-2 font-semibold text-black" href={website} target="_blank">
				<img class="mx-auto" src={www} alt="www-icon"/>
				<h3 class="pt-1">{website}</h3>
			</a>
		</div>
		{/if}
  </div>
</div>
{:else}
<div class="card w-96">
  <figure class="px-10 pt-10">
    <div class="avatar">
			<div class="w-24">
				<img src={visited} alt="visited-icon" />
			</div>
		</div>
  </figure>
  <div class="card-body items-center text-center">
    <h2 class="card-title">{name}</h2>
		<h4>{category ? category : ''}</h4>
    <h4>{address ? address : ''}</h4>
		<h4>{city ? city : ''}</h4>
		{#if phone}
		<a rel="external noreferrer" class="flex font-medium" href={`tel:${phone}`} target="_blank">
			<img class="mr-2" src={telephone} alt="www-icon"/>
			<h4 class="pt-1">{phone}</h4>
		</a>
		{/if}
		{#if website}
		<div class="flex">
			<a rel="external noreferrer" class="pt-2 font-semibold text-black" href={website} target="_blank">
				<img class="mx-auto" src={www} alt="www-icon"/>
				<h3 class="pt-1">{website}</h3>
			</a>
		</div>
		{/if}
  </div>
</div>
{/if}