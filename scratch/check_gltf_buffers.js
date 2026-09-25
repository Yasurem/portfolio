const fs = require('fs');
const path = './frontend/public/models/isometric_cubes.gltf';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log("Buffers:", data.buffers.map(b => b.uri ? b.uri.substring(0, 30) + '...' : 'no uri'));
