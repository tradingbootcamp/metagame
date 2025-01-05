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

const paths = `	<path class="st1" d="M367.96,114.498c-10.809-8.01-28.626-8.204-39.784-0.45c-11.158,7.754-11.44,20.543-0.631,28.546
		c10.822,8.002,28.626,8.203,39.784,0.45C378.487,135.282,378.769,122.507,367.96,114.498z"/>
	<path class="st1" d="M183.676,112.289c-10.816-8.003-28.626-8.211-39.784-0.45c-11.158,7.754-11.44,20.536-0.631,28.538
		c10.808,8.009,28.626,8.204,39.784,0.456C194.203,133.067,194.484,120.291,183.676,112.289z"/>`;

console.log(formatPaths(paths));
