function formatPaths(input) {
  return (
    input
      // Split into separate paths
      .split("/>")
      // Filter out empty strings
      .filter(Boolean)
      // Extract just the d attribute value from each path
      .map((path) => {
        const match = path.match(/d="([^"]+)"/);
        return match
          ? match[1]
              // Remove newlines and extra spaces
              .replace(/\n\t*/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          : null;
      })
      // Filter out nulls
      .filter(Boolean)
  );
}

const paths = `	<path class="st" d="M89.278,248.303c11.158,6.083,20.208,1.961,20.208-9.19c0-11.158-9.05-25.129-20.208-31.211
		c-11.15-6.082-20.194-1.967-20.194,9.191C69.084,228.243,78.128,242.22,89.278,248.303z"/>
	<path class="st" d="M202.064,422.55c11.157,6.082,20.194,1.967,20.194-9.191c0-11.151-9.037-25.128-20.194-31.211
		c-11.158-6.076-20.194-1.96-20.194,9.191C181.87,402.497,190.906,416.468,202.064,422.55z"/>
	<path class="st" d="M145.672,335.423c11.157,6.083,20.2,1.968,20.2-9.19c0-11.151-9.043-25.128-20.2-31.204
		c-11.158-6.082-20.194-1.967-20.194,9.184C125.478,315.37,134.514,329.341,145.672,335.423z"/>`;

console.log(formatPaths(paths));
