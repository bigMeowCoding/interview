import commonjs from 'vite-plugin-commonjs';
import {defineConfig} from "vite";

export default defineConfig({
    plugins: [
        commonjs({
            filter(id) {
                if (id.includes('node_modules/redux-storage/build-es')) {
                    return true;
                }
            },
        }),
        // Other plugins
    ],
    // Other configurations
});