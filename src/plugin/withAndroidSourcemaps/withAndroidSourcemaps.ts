/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type { ConfigPlugin } from "@expo/config-plugins";
import { withAppBuildGradle } from "@expo/config-plugins";

import { SourceMapUploadOptions } from "../getErrorTrackingPluginsFromOptions";

const withAndroidSourcemaps =
  (options: SourceMapUploadOptions): ConfigPlugin<void> =>
  (config) => {
    return withAppBuildGradle(config, async (config) => {
      const appBuildGradle = config.modResults;
      if (appBuildGradle.contents.match("datadog-sourcemaps.gradle")) {
        return config;
      }

      appBuildGradle.contents = appBuildGradle.contents.replace(
        /apply plugin\: \"com\.facebook\.react\"/,
        `apply plugin: "com.facebook.react"\napply from: "${require("path").dirname(
          require.resolve("@datadog/mobile-react-native/package.json")
        )}/datadog-sourcemaps.gradle"`
      );

      if (!options.serviceName) {
        return config;
      }

      // preserves the config set by withAndroidProguardMappingFiles
      if (appBuildGradle.contents.match("datadog {")) {
        appBuildGradle.contents = appBuildGradle.contents.replace(
          /    checkProjectDependencies = "none"/,
          [
            `    checkProjectDependencies = "none"`,
            `    serviceName = "${options.serviceName}"`,
          ].join("\n")
        );
        return config;
      }

      // Add the configuration for the Android Gradle Plugin
      const configBlock = [
        `datadog {`,
        `    serviceName = "${options.serviceName}"`,
        `}`,
        ``,
      ].join("\n");

      appBuildGradle.contents = `${configBlock}${appBuildGradle.contents}`;

      return config;
    });
  };

export default withAndroidSourcemaps;
