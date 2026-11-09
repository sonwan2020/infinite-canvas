/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_RELEASES__: import("@/lib/release").ReleaseInfo[];

interface ImportMetaEnv {
    // Comma-separated local development plugin URLs, refetched on every startup without caching or persistence.
    readonly VITE_DEV_PLUGINS?: string;
    // Optional build-time API key for the built-in Guantou channel (YiSu gateway); the container runtime config takes priority.
    readonly VITE_GUANTOU_API_KEY?: string;
    // Optional build-time base URL for the built-in Guantou channel (YiSu gateway); the container runtime config takes priority.
    readonly VITE_GUANTOU_BASE_URL?: string;
    // Optional build-time analytics configuration, with one independent variable per provider.
    // GA4 measurement ID (G-XXXX)
    readonly VITE_ANALYTICS_GA4_ID?: string;
    // Baidu Analytics site ID
    readonly VITE_ANALYTICS_BAIDU_ID?: string;
    // Optional URL of the new-api console user info page for the top-right link.
    readonly VITE_CONSOLE_URL?: string;
}
