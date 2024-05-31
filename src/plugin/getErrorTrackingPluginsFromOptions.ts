/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type { ConfigPlugin, StaticPlugin } from "@expo/config-plugins";

import withAndroidConfiguration from "./withAndroidConfiguration/withAndroidConfiguration";
import withAndroidProguardMappingFiles from "./withAndroidProguardMappingFiles/withAndroidProguardMappingFiles";
import withAndroidSourcemaps from "./withAndroidSourcemaps/withAndroidSourcemaps";
import withIosDsyms from "./withIosDsyms/withIosDsyms";
import withIosSourcemaps from "./withIosSourcemaps/withIosSourcemaps";

type FileUploadOptions = {
  /**
   * Whether iOS dSYMs upload is enabled (default: true).
   */
  iosDsyms?: boolean;

  /**
   * Whether iOS sourcemaps upload is enabled (default: true).
   */
  iosSourcemaps?: boolean;

  /**
   * Whether Android Proguard mapping files upload is enabled (default: true).
   */
  androidProguardMappingFiles?: boolean;
  /**
   * Whether Android sourcemaps upload is enabled (default: true).
   */
  androidSourcemaps?: boolean;
};

export type SourceMapUploadOptions = {
  /**
   * Service name to use when uploading sourcemaps (default: application's bundle identifier).
   */
  serviceName?: string;
};

export type AndroidProguardMappingFilesOptions = {
  /**
   * Version of dd-sdk-android-gradle-plugin used for Proguard mapping files
   * upload (default: "1.14.0").
   */
  datadogGradlePluginVersion?: string;
};

export type ErrorTrackingOptions = FileUploadOptions &
  SourceMapUploadOptions &
  AndroidProguardMappingFilesOptions;

/**
 * By default, all plugins are enabled. To disable a plugin, you have to set it
 * to `false`.
 */
export const getErrorTrackingPluginsFromOptions = (
  options?: ErrorTrackingOptions,
): (ConfigPlugin<any> | StaticPlugin<any>)[] => {
  const ERROR_TRACKING_CONFIG_PLUGINS_MAP: Record<
    keyof FileUploadOptions,
    ConfigPlugin<any> | StaticPlugin<any>
  > = {
    iosDsyms: withIosDsyms,
    iosSourcemaps: withIosSourcemaps({
      serviceName: options?.serviceName,
    }),
    androidProguardMappingFiles: withAndroidProguardMappingFiles(),
    androidSourcemaps: withAndroidSourcemaps,
  };

  const configPluginsKeys = (
    Object.keys(
      ERROR_TRACKING_CONFIG_PLUGINS_MAP,
    ) as (keyof FileUploadOptions)[]
  ).filter((option) => !options || options[option] !== false);

  return [
    ...configPluginsKeys.map((key) => ERROR_TRACKING_CONFIG_PLUGINS_MAP[key]),
    withAndroidConfiguration({
      serviceName: options?.serviceName,
      datadogGradlePluginVersion: options?.datadogGradlePluginVersion,
    }),
  ];
};
