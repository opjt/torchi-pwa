<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-100 text-base-content font-sans max-w-3xl mx-auto flex flex-col">
	{@render children()}
</div>
