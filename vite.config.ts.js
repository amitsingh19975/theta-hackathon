// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { EsLinter, linterPlugin, TypeScriptLinter } from "vite-plugin-linter";
import * as Path from "path";
var vite_config_default = defineConfig((configEnv) => ({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: "@/assets/scss/main"
    }),
    linterPlugin({
      include: ["./src/**/*.ts", "./src/**/*.tsx"],
      exclude: ["node_modules", "./src/database/**/*"],
      linters: [new EsLinter({ configEnv }), new TypeScriptLinter()]
    })
  ],
  resolve: {
    alias: {
      "@": Path.resolve("/Users/amit/Desktop/code/hackathon/theta", "./src"),
      db: Path.resolve("/Users/amit/Desktop/code/hackathon/theta", "./src/database/src"),
      web3: "web3/dist/web3.min.js"
    },
    extensions: ["", ".js", ".ts", ".vue"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qIGVzbGludCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXM6IDAgKi9cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgeyBxdWFzYXIsIHRyYW5zZm9ybUFzc2V0VXJscyB9IGZyb20gJ0BxdWFzYXIvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgRXNMaW50ZXIsIGxpbnRlclBsdWdpbiwgVHlwZVNjcmlwdExpbnRlciB9IGZyb20gJ3ZpdGUtcGx1Z2luLWxpbnRlcic7XG5pbXBvcnQgKiBhcyBQYXRoIGZyb20gJ3BhdGgnO1xuXG4vKiBlc2xpbnQgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzOiAyICovXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoY29uZmlnRW52KSA9PiAoe1xuICAgIHBsdWdpbnM6IFtcbiAgICAgICAgdnVlKHtcbiAgICAgICAgICAgIHRlbXBsYXRlOiB7IHRyYW5zZm9ybUFzc2V0VXJscyB9LFxuICAgICAgICB9KSwgcXVhc2FyKHtcbiAgICAgICAgICAgIHNhc3NWYXJpYWJsZXM6ICdAL2Fzc2V0cy9zY3NzL21haW4nLFxuICAgICAgICB9KSxcbiAgICAgICAgbGludGVyUGx1Z2luKHtcbiAgICAgICAgICAgIGluY2x1ZGU6IFsnLi9zcmMvKiovKi50cycsICcuL3NyYy8qKi8qLnRzeCddLFxuICAgICAgICAgICAgZXhjbHVkZTogWydub2RlX21vZHVsZXMnLCAnLi9zcmMvZGF0YWJhc2UvKiovKiddLFxuICAgICAgICAgICAgbGludGVyczogW25ldyBFc0xpbnRlcih7IGNvbmZpZ0VudiB9KSwgbmV3IFR5cGVTY3JpcHRMaW50ZXIoKV0sXG4gICAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgJ0AnOiBQYXRoLnJlc29sdmUoXCIvVXNlcnMvYW1pdC9EZXNrdG9wL2NvZGUvaGFja2F0aG9uL3RoZXRhXCIsICcuL3NyYycpLFxuICAgICAgICAgICAgZGI6IFBhdGgucmVzb2x2ZShcIi9Vc2Vycy9hbWl0L0Rlc2t0b3AvY29kZS9oYWNrYXRob24vdGhldGFcIiwgJy4vc3JjL2RhdGFiYXNlL3NyYycpLFxuICAgICAgICAgICAgd2ViMzogJ3dlYjMvZGlzdC93ZWIzLm1pbi5qcycsXG4gICAgICAgIH0sXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnJywgJy5qcycsICcudHMnLCAnLnZ1ZSddLFxuICAgIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBLElBQU8sc0JBQVEsYUFBYSxDQUFDLGNBQWU7QUFBQSxFQUN4QyxTQUFTO0FBQUEsSUFDTCxJQUFJO0FBQUEsTUFDQSxVQUFVLEVBQUUsbUJBQW1CO0FBQUEsSUFDbkMsQ0FBQztBQUFBLElBQUcsT0FBTztBQUFBLE1BQ1AsZUFBZTtBQUFBLElBQ25CLENBQUM7QUFBQSxJQUNELGFBQWE7QUFBQSxNQUNULFNBQVMsQ0FBQyxpQkFBaUIsZ0JBQWdCO0FBQUEsTUFDM0MsU0FBUyxDQUFDLGdCQUFnQixxQkFBcUI7QUFBQSxNQUMvQyxTQUFTLENBQUMsSUFBSSxTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQztBQUFBLElBQ2pFLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLEFBQUssYUFBUSw0Q0FBNEMsT0FBTztBQUFBLE1BQ3JFLElBQUksQUFBSyxhQUFRLDRDQUE0QyxvQkFBb0I7QUFBQSxNQUNqRixNQUFNO0FBQUEsSUFDVjtBQUFBLElBQ0EsWUFBWSxDQUFDLElBQUksT0FBTyxPQUFPLE1BQU07QUFBQSxFQUN6QztBQUNKLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
