/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type { ConfigPlugin } from "@expo/config-plugins";
import { withAppBuildGradle } from "@expo/config-plugins";

const withAndroidProguardMappingFiles = (): ConfigPlugin<void> => (config) => {
  return withAppBuildGradle(config, (config) => {
    const appBuildGradle = config.modResults;
    if (appBuildGradle.contents.includes('tasks["uploadMapping')) {
      return config;
    }

    // Automate the plugin to run after each build
    const automationBlock = [
      ``,
      `android {`,
      `    applicationVariants.all { variant ->`,
      `        if (project.tasks.findByName("minify\${variant.name.capitalize()}WithR8")) {`,
      `            tasks["minify\${variant.name.capitalize()}WithR8"].finalizedBy { tasks["uploadMapping\${variant.name.capitalize()}"] }`,
      `        }`,
      `    }`,
      `}`,
      ``,
    ].join("\n");
    appBuildGradle.contents = `${appBuildGradle.contents}${automationBlock}`;

    return config;
  });
};

export default withAndroidProguardMappingFiles;
