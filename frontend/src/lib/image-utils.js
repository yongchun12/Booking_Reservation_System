/**
 * Transforms an S3 URL into a proxy URL if needed.
 * This bypasses browser-side CORS/ACL issues by fetching images via the backend.
 * @param {string} url - The original image URL
 * @returns {string} - The proxy URL or original URL
 */
export function getProxiedImageUrl(url) {
    if (!url) return null;
    if (url.includes('s3.us-east-1.amazonaws.com') || url.includes('.s3.amazonaws.com')) {
        // Extract key after bucket URL
        // Example: https://bucket.s3.../folder/file.png -> folder/file.png
        try {
            const urlObj = new URL(url);
            // Pathname includes leading slash, remove it
            const key = urlObj.pathname.substring(1);
            // Use window.location.origin to point to current backend (via proxy likely) or direct
            // Assuming frontend uses /api proxy via Vite in dev, or direct to backend in prod.
            // But here we need the Backend API URL.
            // Since api.js uses relative or configured base, let's assume /api/images relative path works 
            // if React App is served by same origin or proxy is set up.

            // However, `api.js` defines baseURL. Using straight `/api/images` might fail if backend is on localhost:5000 and frontend on localhost:5173.
            // Ideally, we use the `api` instance's base URL, but that's messy to import here if it's dynamic.
            // Let's rely on the relative path which should be handled by Nginx/Vite proxy.

            return `/api/images/${key}`;
        } catch (e) {
            console.error("Failed to parse S3 URL", e);
            return url;
        }
    }
    return url;
}
