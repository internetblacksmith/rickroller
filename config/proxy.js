// Proxy configuration
// You can use free proxy services or paid ones like:
// - ProxyMesh, Bright Data, ScraperAPI, etc.

const proxies = [
  // Add your proxy URLs here
  // Format: 'http://username:password@proxy-server.com:port'
  // For testing, you can use free proxies but they're unreliable
  process.env.PROXY_URL_1,
  process.env.PROXY_URL_2,
  process.env.PROXY_URL_3,
].filter(Boolean);

let currentProxyIndex = 0;

function getNextProxy() {
  if (proxies.length === 0) return null;
  
  const proxy = proxies[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
  return proxy;
}

module.exports = { getNextProxy, proxies };