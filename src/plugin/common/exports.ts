/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

export const IOS_SOURCEMAP_FILE_EXPORT =
  "export SOURCEMAP_FILE=$DERIVED_FILE_DIR/main.jsbundle.map";

export const IOS_DATADOG_CI_EXPORT = `
if [[ -z "$DATADOG_CI_EXEC" ]]; then
    DATADOG_CI_EXEC="$("$NODE_BINARY" --print "require('path').resolve(require('path').dirname(require.resolve('@datadog/datadog-ci/package.json')), '../../.bin/datadog-ci')")";
    
    # Check if the file exists and is executable
    if [[ -x "$DATADOG_CI_EXEC" ]]; then
        export DATADOG_CI_EXEC;
    else
        echo "Error: DATADOG_CI_EXEC does not exist or is not executable";
        exit 1;
    fi
fi
`;
