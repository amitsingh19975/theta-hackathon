/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EDGESTORE_URL?: string;
  readonly VITE_SERVER_URL: string;
  readonly VITE_THETANET_URL?: string;
  readonly VITE_THETANET_CHAINID?: number;
  readonly VITE_DB_PORT?: number;
  readonly VITE_INIT_FIREBASE?: boolean;
  readonly INIT_FIREBASE?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
