/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type { ConfigPlugin } from "@expo/config-plugins";
import { withAppBuildGradle } from "@expo/config-plugins";

import { SourceMapUploadOptions } from "../getErrorTrackingPluginsFromOptions";

const withAndroidConfiguration =
  (options: SourceMapUploadOptions): ConfigPlugin<void> =>
  (config) => {
    return withAppBuildGradle(config, async (config) => {
      const appBuildGradle = config.modResults;
      if (appBuildGradle.contents.match("datadog {")) {
        return config;
      }

      // Add the configuration for the Android Gradle Plugin
      const configBlock = [
        `datadog {`,
        `    checkProjectDependencies = "none"`,
        `}`,
        ``,
      ];

      if (options.serviceName) {
        const serviceNameBlock = `    serviceName = "${options.serviceName}"`;
        configBlock.splice(2, 0, serviceNameBlock);
      }

      appBuildGradle.contents = `${configBlock.join("\n")}${
        appBuildGradle.contents
      }`;

      return config;
    });
  };

export default withAndroidConfiguration;
