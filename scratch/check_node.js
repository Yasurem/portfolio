const fs = require('fs');
const path = './frontend/public/models/isometric_cubes.gltf';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const meshIndex = data.meshes.findIndex(m => m.name === "Cube.159");
console.log("Mesh index for Cube.159:", meshIndex);

if (meshIndex !== -1) {
  const node = data.nodes.find(n => n.mesh === meshIndex);
  console.log("Node pointing to this mesh:", node ? node.name : "None");
}
