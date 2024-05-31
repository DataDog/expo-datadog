/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type { ConfigPlugin } from "@expo/config-plugins";
import { withAppBuildGradle } from "@expo/config-plugins";

import {
  AndroidProguardMappingFilesOptions,
  SourceMapUploadOptions,
} from "../getErrorTrackingPluginsFromOptions";

const DEFAULT_DATADOG_GRADLE_PLUGIN_VERSION = "1.14.0";

const withAndroidConfiguration =
  (
    options: SourceMapUploadOptions & AndroidProguardMappingFilesOptions,
  ): ConfigPlugin<void> =>
  (config) => {
    return withAppBuildGradle(config, async (config) => {
      const appBuildGradle = config.modResults;
      if (appBuildGradle.contents.match("datadog {")) {
        return config;
      }

      const datadogGradlePluginVersion =
        options.datadogGradlePluginVersion ||
        DEFAULT_DATADOG_GRADLE_PLUGIN_VERSION;

      // We could set the serviceName through project.ext.datadog when proguard mapping
      // files upload is disabled, but it is simpler to always have the plugin installed
      // and use the datadog closure to provide it to both android file uploads.
      const configBlock = [
        `plugins {`,
        `    id("com.datadoghq.dd-sdk-android-gradle-plugin") version "${datadogGradlePluginVersion}"`,
        `}`,
        ``,
        `datadog {`,
        `    checkProjectDependencies = "none"`,
        `}`,
        ``,
      ];

      if (options.serviceName) {
        const serviceNameBlock = `    serviceName = "${options.serviceName}"`;
        configBlock.splice(6, 0, serviceNameBlock);
      }

      appBuildGradle.contents = `${configBlock.join("\n")}${
        appBuildGradle.contents
      }`;

      return config;
    });
  };

export default withAndroidConfiguration;
