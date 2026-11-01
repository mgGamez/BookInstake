import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([...nextVitals, globalIgnores([".agents/**", ".next/**", ".taste-skill/**", "out/**", "node_modules/**"])]);
