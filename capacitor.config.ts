import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'learner',
  webDir: 'out',
    server: {
    url: 'http://192.168.1.14:3000',
    cleartext: true,
  },
};

export default config;
