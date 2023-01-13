<script>
  import '../app.css';
  import logo from '$lib/assets/instabiter.png';
</script>


<div id="remote-container" style="background-color: black;">
  <div class="flex flex-grow">
    <img class="w-full mx-auto max-w-7xl" alt="logo" src={logo} />
  </div>
</div>
<slot/>
