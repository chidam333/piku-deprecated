import adapter from '@sveltejs/adapter-auto';
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	vite: {
		ssr: {
		  noExternal: ['@googlemaps/js-api-loader']
		}
	  },	  
	preprocess: [
		preprocess({
		  postcss: true,
		}),
	  ],
	kit: {
		adapter: adapter()
	}
};

export default config;
