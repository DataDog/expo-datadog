# Expo Datadog

The Expo Datadog plugin (expo-datadog) is an Expo Config Plugin that automates the setup of crash reporting and error tracking for your Expo application. It ensures that all required debug artifacts—such as dSYMs, Proguard/R8 mapping files, and JavaScript sourcemaps—are automatically uploaded to Datadog during the build process.

To accomplish this, the plugin applies platform-specific build integrations:

**iOS**
- Adds an Xcode build phase to upload dSYMs using `datadog-ci dsyms upload`
- Modifies the "Bundle React Native code and images" build phase to upload sourcemaps using `datadog-ci react-native xcode`

**Android**
- Adds the Datadog Gradle plugin (`com.datadoghq.dd-sdk-android-gradle-plugin`)
- Configures automatic Proguard/R8 mapping file uploads after minification
- Applies the `datadog-sourcemaps.gradle` script to upload JavaScript sourcemaps

## Setup

**Note**: Make sure you've set up and initialized the [Datadog React Native SDK][1] before using this plugin.

### Prerequisites

Install the required peer dependencies:

```sh
npm install @datadog/mobile-react-native expo-datadog
```

or with Yarn:

```sh
yarn add @datadog/mobile-react-native expo-datadog
```

You also need `@datadog/datadog-ci` for uploading symbols:

```sh
npm install --save-dev @datadog/datadog-ci
```

### Configure the Plugin

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": ["expo-datadog"]
  }
}
```

### Configure Datadog CI

Create a `datadog-ci.json` file at the root of your project to configure the Datadog CI tool for uploading symbols and sourcemaps:

```json
{
  "apiKey": "<YOUR_DATADOG_API_KEY>",
  "datadogSite": "datadoghq.com"
}
```

#### datadog-ci.json Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `apiKey` | `string` | required | Your Datadog API key |
| `datadogSite` | `string` | `"datadoghq.com"` | The Datadog site to upload symbols to |

#### Available Datadog Sites

| Site | URL |
|------|-----|
| US1 | `datadoghq.com` |
| US3 | `us3.datadoghq.com` |
| US5 | `us5.datadoghq.com` |
| EU1 | `datadoghq.eu` |
| AP1 | `ap1.datadoghq.com` |
| AP2 | `ap2.datadoghq.com` |
| US1-FED | `ddog-gov.com` |

Alternatively, you can set these values as environment variables:

```sh
export DATADOG_API_KEY=<your-api-key>
export DATADOG_SITE=datadoghq.com
```

## Configuration Options

All configuration properties are optional. By default, all upload features are enabled.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `iosDsyms` | `boolean` | `true` | Whether iOS dSYMs upload is enabled |
| `iosSourcemaps` | `boolean` | `true` | Whether iOS sourcemaps upload is enabled |
| `androidProguardMappingFiles` | `boolean` | `true` | Whether Android Proguard mapping files upload is enabled |
| `androidSourcemaps` | `boolean` | `true` | Whether Android sourcemaps upload is enabled |
| `serviceName` | `string` | app bundle identifier | Service name used when uploading sourcemaps (both iOS and Android) |
| `datadogGradlePluginVersion` | `string` | `"1.14.0"` | Version of dd-sdk-android-gradle-plugin for Proguard mapping uploads |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_BINARY` | Path to Node.js binary, used in iOS build phases |
| `DATADOG_CI_EXEC` | Path to the datadog-ci executable (auto-detected if not set) |
| `DATADOG_API_KEY` | Your Datadog API key (can be set in `datadog-ci.json` instead) |
| `DATADOG_SITE` | Your Datadog site (can be set in `datadog-ci.json` instead) |

## Platform-Specific Setup

### iOS Setup

The plugin automatically configures Xcode build phases to upload dSYMs and sourcemaps. For the build phases to work correctly, ensure that:

1. Your `.xcode.env` or `.xcode.env.local` file contains the `NODE_BINARY` path:

```sh
# .xcode.env.local
export NODE_BINARY=$(command -v node)
```

2. Create a `datadog-ci.json` file at the root of your project (see [Configure Datadog CI](#configure-datadog-ci)), or set your Datadog API key as an environment variable before building:

```sh
export DATADOG_API_KEY=<your-api-key>
```

### Android Setup

#### Enabling Proguard Mapping File Uploads

To upload native Android debug symbols (Proguard/R8 mapping files), you must enable minification in your release builds. Add the following to your `android/gradle.properties`:

```properties
android.enableMinifyInReleaseBuilds=true
```

Without this setting, no mapping files are generated and the `androidProguardMappingFiles` option has no effect.

#### Datadog API Key

Create a `datadog-ci.json` file at the root of your project (see [Configure Datadog CI](#configure-datadog-ci)), or set your Datadog API key in your `android/gradle.properties` or as an environment variable:

```properties
DATADOG_API_KEY=<your-api-key>
```

## Configuration Examples

### Full Configuration with All Options

```json
{
  "expo": {
    "plugins": [
      [
        "expo-datadog",
        {
          "errorTracking": {
            "iosDsyms": true,
            "iosSourcemaps": true,
            "androidProguardMappingFiles": true,
            "androidSourcemaps": true,
            "serviceName": "com.mycompany.myapp",
            "datadogGradlePluginVersion": "1.22.0"
          }
        }
      ]
    ]
  }
}
```

## Build Workflow

After configuring the plugin, run `expo prebuild` to generate the native projects with Datadog configuration:

> [!Important]
> These commands create proper release builds and trigger Datadog uploads, but they do not automatically upload your app to App Store Connect or Google Play.

```sh
# Generate native projects
npx expo prebuild

# Build for iOS
npx expo run:ios --configuration Release

# Build for iOS (alternative using xcodebuild)
cd ios && xcodebuild -workspace <YourApp>.xcworkspace -scheme <YourApp> -configuration Release -sdk iphoneos

# Build for Android
npx expo run:android --variant release

# Build for Android (alternative using Gradle directly)
cd android && DATADOG_API_KEY=<your-api-key> ./gradlew assembleRelease
```

**Note for EAS Build**: When using EAS Build, set your `DATADOG_API_KEY` as a secret in your EAS project settings:

```sh
eas secret:create --name DATADOG_API_KEY --value <your-api-key>
```

## Troubleshooting

### Node binary not found when using NVM

When using NVM (Node Version Manager), the Xcode build phase may not find your Node installation. To fix this, create an `ios/.xcode.env.local` file (this file is gitignored by default):

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export NODE_BINARY=$(command -v node)
```

### Android: "No such remote 'origin'" error

If you encounter the following error during Android builds:

```
> Task :app:uploadMappingRelease FAILED
error: No such remote 'origin'
```

This occurs because the Datadog Gradle plugin expects a git repository with a remote configured. To fix this, initialize a git repository and add a remote:

```sh
git init
git remote add origin <your-repository-url>
```

### iOS: dSYMs upload failing

If dSYM uploads fail, ensure that:

1. Your `datadog-ci.json` file exists at the project root with valid credentials
2. The `DATADOG_API_KEY` environment variable is set if not using `datadog-ci.json`
3. Your build is generating dSYMs (check Build Settings → Debug Information Format is set to "DWARF with dSYM File")

### Android: Sourcemaps not uploading

Ensure that:

1. You have `@datadog/datadog-ci` installed as a dev dependency
2. Your `datadog-ci.json` file or environment variables are correctly configured
3. You're building a release variant (sourcemaps are not uploaded for debug builds)


## Contributing

If you find an issue with this package and have a fix, please consult the [Contributing Guidelines][2].

## Further Reading

- [Expo and Expo Go documentation][1]
- [Expo Crash Reporting and Error Tracking documentation][3]
- [Datadog CI Configuration][4]

[1]: https://docs.datadoghq.com/real_user_monitoring/reactnative/expo/
[2]: https://github.com/DataDog/expo-datadog/blob/main/CONTRIBUTING.md
[3]: https://docs.datadoghq.com/real_user_monitoring/error_tracking/expo/
[4]: https://docs.datadoghq.com/continuous_testing/cicd_integrations/configuration/
