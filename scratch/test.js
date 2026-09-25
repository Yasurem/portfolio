const THREE = require('three');
const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI / 4);
const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
const e = m.elements;
for(let k=0; k<16; k++) e[k] = Math.round(e[k]);
const q2 = new THREE.Quaternion().setFromRotationMatrix(m);
const euler = new THREE.Euler().setFromQuaternion(q2);
console.log("Euler:", euler.x, euler.y, euler.z);
