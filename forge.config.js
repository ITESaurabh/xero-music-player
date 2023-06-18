module.exports = {
  packagerConfig: {
    icon: './src/assets/logo/XeroTunesLogo',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // name: "xero_player",
        icon: './src/assets/logo/XeroTunesLogo.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        devContentSecurityPolicy: "'unsafe-eval'",
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              // preload: {
              //   js: "./src/preload.js",
              // },
            },
            // {
            //   html: "./src/loader.html",
            //   js: "./src/renderer2.js",
            //   name: "loading",
            // },
          ],
        },
      },
    },
  ],
};
