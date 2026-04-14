const rawClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const clientIdPrefix = rawClientId.replace('.apps.googleusercontent.com', '');
const reversedClientId = clientIdPrefix
  ? `com.googleusercontent.apps.${clientIdPrefix}`
  : '';

module.exports = {
  expo: {
    name: 'Club Scentra',
    slug: 'club-scentra',
    owner: 'scentramotors',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: ['clubscentra', ...(reversedClientId ? [reversedClientId] : [])],
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.clubscentra.app',
      entitlements: {
        'com.apple.developer.applesignin': ['Default'],
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              'clubscentra',
              ...(reversedClientId ? [reversedClientId] : []),
            ],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.clubscentra.app',
      intentFilters: reversedClientId
        ? [
            {
              action: 'VIEW',
              autoVerify: true,
              data: [{ scheme: reversedClientId }],
              category: ['BROWSABLE', 'DEFAULT'],
            },
          ]
        : [],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/icon.png',
    },
    plugins: [
      'expo-router',
      'expo-apple-authentication',
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow Club Scentra to access your photos to upload event images.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#E8EAED',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'a8dd1df7-3d3e-40ae-92dc-0f147c087866',
      },
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/a8dd1df7-3d3e-40ae-92dc-0f147c087866',
    },
  },
};
