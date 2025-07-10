/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type { ConfigPlugin } from "@expo/config-plugins";
import { withAppBuildGradle } from "@expo/config-plugins";
import path from "path";

const withAndroidSourcemaps: ConfigPlugin<void> = (config) => {
  return withAppBuildGradle(config, async (config) => {
    const appBuildGradle = config.modResults;
    if (appBuildGradle.contents.match("datadog-sourcemaps.gradle")) {
      return config;
    }
    const datadogNodeModulesRoot = path.dirname(
      require.resolve("@datadog/mobile-react-native/package.json")
    );
    const gradlePluginRelativePath = path.relative(
      path.join(config.modRequest.projectRoot, "android", "app"),
      path.join(datadogNodeModulesRoot)
    );
    const sourcemapsGradlePath =
      `${gradlePluginRelativePath}/datadog-sourcemaps.gradle`.replace(
        /\\/g,
        "/"
      );
    appBuildGradle.contents = appBuildGradle.contents.replace(
      /apply plugin: "com\.facebook\.react"/,
      `apply plugin: "com.facebook.react"\napply from: "${sourcemapsGradlePath}"`
    );

    return config;
  });
};

export default withAndroidSourcemaps;
