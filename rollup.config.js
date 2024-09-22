import typescript from 'rollup-plugin-typescript';
import json from  '@rollup/plugin-json';

export default {
	input: './src/index.ts',
	output: {
		file: './extjss.js',
        format: 'iife'
	},
	plugins: [
		json(),
		typescript(),
	]
};
