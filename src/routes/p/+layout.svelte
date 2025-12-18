<script lang="ts">
	let { children } = $props();
</script>
<div class="min-h-100 text-base-content  mx-auto flex flex-col font-sans max-w-3xl 2xl:my-10">
    {@render children()}
</div>
