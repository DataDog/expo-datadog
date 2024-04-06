/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type { ConfigPlugin } from "@expo/config-plugins";
import { withXcodeProject } from "@expo/config-plugins";

import { SourceMapUploadOptions } from "../getErrorTrackingPluginsFromOptions";

const SOURCEMAP_FILE_COMMAND =
  "export SOURCEMAP_FILE=$DERIVED_FILE_DIR/main.jsbundle.map";
const getDatadogXCodeCommand = (
  serviceName: SourceMapUploadOptions["serviceName"]
) =>
  `npx datadog-ci react-native xcode \`\\\"$NODE_BINARY\\\" --print \\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\"\`${
    serviceName ? ` --service ${serviceName}` : ""
  }`;

const withIosSourcemaps =
  (options: SourceMapUploadOptions): ConfigPlugin<void> =>
  (config) => {
    return withXcodeProject(config, async (config) => {
      const xcodeProject = config.modResults;
      const bundlePhase = xcodeProject.pbxItemByComment(
        "Bundle React Native code and images",
        "PBXShellScriptBuildPhase"
      );
      if (bundlePhase.shellScript.match("datadog-ci react-native xcode")) {
        return config;
      }
      if (bundlePhase.shellScript.match("sentry")) {
        /**
         * In the case where Sentry is already added, we add a new line to
         * bundle the javascript code twice and this time send the sourcemap
         * to Datadog.
         * That's the safest way to make sure we don't break the script.
         *
         * We also need to remove the final " and add it back for the script to
         * be well-formatted.
         */
        bundlePhase.shellScript = `${bundlePhase.shellScript.replace(
          /.$/,
          ""
        )}\\n ${getDatadogXCodeCommand(options.serviceName)}"`;

        return config;
      }

      const [beforeScript, afterScript] = bundlePhase.shellScript.split(
        "`\\\"$NODE_BINARY\\\" --print \\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\"`"
      );
      const datadogScript = `${SOURCEMAP_FILE_COMMAND}\\n ${getDatadogXCodeCommand(
        options.serviceName
      )}`;
      bundlePhase.shellScript = `${beforeScript}${datadogScript}${afterScript}`;

      return config;
    });
  };

export default withIosSourcemaps;
