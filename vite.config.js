import { sveltekit } from '@sveltejs/kit/vite';

const config = {
	optimizeDeps: {
    exclude: ["firebase", "firebase/app", "firebase/auth", "firebase/firestore", "firebase/analytics"],
  },
	plugins: [sveltekit()]
};

export default config;
