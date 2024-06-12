export const escapeStringForIOSBuildPhase = (str: string) => {
  return str
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, "\\n"); // Replace newlines with \n
};
