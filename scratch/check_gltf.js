const fs = require('fs');
const path = './frontend/public/models/isometric_cubes.gltf';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log("Total meshes:", data.meshes ? data.meshes.length : 0);
console.log("Total nodes:", data.nodes ? data.nodes.length : 0);

// Just print the names of all nodes that have a mesh
const meshNodes = data.nodes.filter(n => n.mesh !== undefined);
console.log("Nodes with meshes:", meshNodes.map(n => n.name).join(', '));
