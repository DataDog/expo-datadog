/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import { withXcodeProject } from "@expo/config-plugins";

import withIosSourcemaps from "../withIosSourcemaps/withIosSourcemaps";
import pristineProject from "./__fixtures__/pristineProjectPbxproj.json";
import sentryProject from "./__fixtures__/sentryProjectPbxproj.json";

jest.mock("@expo/config-plugins", () => {
  return {
    ...(jest.requireActual("@expo/config-plugins") as object),
    withXcodeProject: jest.fn(),
  };
});

const mockXcodeProject = (mock: object) => {
  const xcodeProject = { ...mock };
  // @ts-ignore
  withXcodeProject.mockImplementationOnce((config, callback) => {
    // @ts-ignore
    return callback({
      ...config,
      modResults: {
        pbxItemByComment: () => xcodeProject,
      },
      xcodeProject,
    });
  });
};

/**
 * This must return a new instance each time to avoid overriding the same object
 * on different tests
 */
const createFakeConfig = () => ({
  name: "project name",
  slug: "project-name",
});

describe("withIosSourcemaps", () => {
  beforeEach(() => {
    (withXcodeProject as any).mockClear();
  });
  describe("on pristine project", () => {
    it("adds script to upload sourcemaps to Datadog", async () => {
      mockXcodeProject(pristineProject);
      const result = (await withIosSourcemaps({})(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toMatchInlineSnapshot(
        `"\\"if [[ -f \\\\\\"$PODS_ROOT/../.xcode.env\\\\\\" ]]; then\\\\n  source \\\\\\"$PODS_ROOT/../.xcode.env\\\\\\"\\\\nfi\\\\nif [[ -f \\\\\\"$PODS_ROOT/../.xcode.env.local\\\\\\" ]]; then\\\\n  source \\\\\\"$PODS_ROOT/../.xcode.env.local\\\\\\"\\\\nfi\\\\n\\\\n# The project root by default is one level up from the ios directory\\\\nexport PROJECT_ROOT=\\\\\\"$PROJECT_DIR\\\\\\"/..\\\\n\\\\nif [[ \\\\\\"$CONFIGURATION\\\\\\" = *Debug* ]]; then\\\\n  export SKIP_BUNDLING=1\\\\nfi\\\\nexport SOURCEMAP_FILE=$DERIVED_FILE_DIR/main.jsbundle.map\\\\n npx datadog-ci react-native xcode \`\\\\\\"$NODE_BINARY\\\\\\" --print \\\\\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\\\\"\`\\\\n\\\\n\\""`
      );
    });
    it("adds script to upload sourcemaps to Datadog with custom service name", async () => {
      mockXcodeProject(pristineProject);
      const result = (await withIosSourcemaps({
        serviceName: "com.company.app",
      })(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toMatchInlineSnapshot(
        `"\\"if [[ -f \\\\\\"$PODS_ROOT/../.xcode.env\\\\\\" ]]; then\\\\n  source \\\\\\"$PODS_ROOT/../.xcode.env\\\\\\"\\\\nfi\\\\nif [[ -f \\\\\\"$PODS_ROOT/../.xcode.env.local\\\\\\" ]]; then\\\\n  source \\\\\\"$PODS_ROOT/../.xcode.env.local\\\\\\"\\\\nfi\\\\n\\\\n# The project root by default is one level up from the ios directory\\\\nexport PROJECT_ROOT=\\\\\\"$PROJECT_DIR\\\\\\"/..\\\\n\\\\nif [[ \\\\\\"$CONFIGURATION\\\\\\" = *Debug* ]]; then\\\\n  export SKIP_BUNDLING=1\\\\nfi\\\\nexport SOURCEMAP_FILE=$DERIVED_FILE_DIR/main.jsbundle.map\\\\n npx datadog-ci react-native xcode \`\\\\\\"$NODE_BINARY\\\\\\" --print \\\\\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\\\\"\` --service com.company.app\\\\n\\\\n\\""`
      );
    });
  });
  describe("on projects implementing Sentry", () => {
    it("adds script to upload sourcemaps to Datadog", async () => {
      mockXcodeProject(sentryProject);
      const result = (await withIosSourcemaps({})(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toMatchInlineSnapshot(
        `"\\"export SENTRY_PROPERTIES=sentry.properties\\\\nexport EXTRA_PACKAGER_ARGS=\\\\\\"--sourcemap-output $DERIVED_FILE_DIR/main.jsbundle.map\\\\\\"\\\\nif [[ -f \\\\\\"$PODS_ROOT/../.xcode.env\\\\\\" ]]; then\\\\n  source \\\\\\"$PODS_ROOT/../.xcode.env\\\\\\"\\\\nfi\\\\nif [[ -f \\\\\\"$PODS_ROOT/../.xcode.env.local\\\\\\" ]]; then\\\\n  source \\\\\\"$PODS_ROOT/../.xcode.env.local\\\\\\"\\\\nfi\\\\n\\\\n# The project root by default is one level up from the ios directory\\\\nexport PROJECT_ROOT=\\\\\\"$PROJECT_DIR\\\\\\"/..\\\\n\\\\nif [[ \\\\\\"$CONFIGURATION\\\\\\" = *Debug* ]]; then\\\\n  export SKIP_BUNDLING=1\\\\nfi\\\\n\`node --print \\\\\\"require.resolve('@sentry/cli/package.json').slice(0, -13) + '/bin/sentry-cli'\\\\\\"\` react-native xcode --force-foreground \`\\\\\\"$NODE_BINARY\\\\\\" --print \\\\\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\\\\"\`\\\\n\\\\n\\\\n npx datadog-ci react-native xcode \`\\\\\\"$NODE_BINARY\\\\\\" --print \\\\\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\\\\"\`\\""`
      );
    });
    it("adds script to upload sourcemaps to Datadog with custom service name", async () => {
      mockXcodeProject(sentryProject);
      const result = (await withIosSourcemaps({
        serviceName: "com.company.app",
      })(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toMatchInlineSnapshot(
        `"\\"export SENTRY_PROPERTIES=sentry.properties\\\\nexport EXTRA_PACKAGER_ARGS=\\\\\\"--sourcemap-output $DERIVED_FILE_DIR/main.jsbundle.map\\\\\\"\\\\nif [[ -f \\\\\\"$PODS_ROOT/../.xcode.env\\\\\\" ]]; then\\\\n  source \\\\\\"$PODS_ROOT/../.xcode.env\\\\\\"\\\\nfi\\\\nif [[ -f \\\\\\"$PODS_ROOT/../.xcode.env.local\\\\\\" ]]; then\\\\n  source \\\\\\"$PODS_ROOT/../.xcode.env.local\\\\\\"\\\\nfi\\\\n\\\\n# The project root by default is one level up from the ios directory\\\\nexport PROJECT_ROOT=\\\\\\"$PROJECT_DIR\\\\\\"/..\\\\n\\\\nif [[ \\\\\\"$CONFIGURATION\\\\\\" = *Debug* ]]; then\\\\n  export SKIP_BUNDLING=1\\\\nfi\\\\n\`node --print \\\\\\"require.resolve('@sentry/cli/package.json').slice(0, -13) + '/bin/sentry-cli'\\\\\\"\` react-native xcode --force-foreground \`\\\\\\"$NODE_BINARY\\\\\\" --print \\\\\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\\\\"\`\\\\n\\\\n\\\\n npx datadog-ci react-native xcode \`\\\\\\"$NODE_BINARY\\\\\\" --print \\\\\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\\\\"\` --service com.company.app\\""`
      );
    });
  });
});
