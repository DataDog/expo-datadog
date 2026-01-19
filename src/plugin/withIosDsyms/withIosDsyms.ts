/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type { ConfigPlugin } from "@expo/config-plugins";
import { withXcodeProject } from "@expo/config-plugins";

import { IOS_DSYMS_BUILD_PHASE_NAME } from "../common/config";
import { IOS_DATADOG_CI_EXPORT } from "../common/exports";

const withIosDsyms: ConfigPlugin<void> = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const buildPhase = xcodeProject.pbxItemByComment(
      IOS_DSYMS_BUILD_PHASE_NAME,
      "PBXShellScriptBuildPhase"
    );
    if (buildPhase) {
      return config;
    }

    xcodeProject.addBuildPhase(
      [],
      "PBXShellScriptBuildPhase",
      IOS_DSYMS_BUILD_PHASE_NAME,
      null /* target */,
      {
        shellScript: `set -e

if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi

if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

if [[ -z "$NODE_BINARY" ]]; then
    echo "ERROR: NODE_BINARY env variable is not set"
fi
${IOS_DATADOG_CI_EXPORT}
$DATADOG_CI_EXEC dsyms upload $DWARF_DSYM_FOLDER_PATH
        `,
        shellPath: "/bin/sh",
        inputPaths: [
          '"$(DWARF_DSYM_FOLDER_PATH)/$(DWARF_DSYM_FILE_NAME)"',
          '"$(DWARF_DSYM_FOLDER_PATH)/$(DWARF_DSYM_FILE_NAME)/Contents/Resources/DWARF/$(PRODUCT_NAME)"',
          '"$(DWARF_DSYM_FOLDER_PATH)/$(DWARF_DSYM_FILE_NAME)/Contents/Info.plist"',
        ],
        outputPaths: ['"$(DERIVED_FILE_DIR)/datadog-dsym-upload-marker"'],
      }
    );

    return config;
  });
};

export default withIosDsyms;
