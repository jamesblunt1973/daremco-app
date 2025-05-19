import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.daremco.app',
    appName: 'daremco-app',
    webDir: 'www',
    plugins: {
        Keyboard: {
            resize: 'body',
            resizeOnFullScreen: true
        }
    }
};

export default config;
