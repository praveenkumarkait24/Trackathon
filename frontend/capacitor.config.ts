import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trackathon.app',
  appName: 'Trackathon',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
