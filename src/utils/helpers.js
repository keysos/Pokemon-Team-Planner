// Format Pokemon names from API format to display format
export function formatName(name) {
    return name
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Extract Pokedex number from API URL
export function getDexNumber(url) {
    const parts = url.split("/").filter(Boolean);
    return parseInt(parts[parts.length - 1]);
}
