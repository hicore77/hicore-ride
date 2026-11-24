import * as W from 'three/webgpu';
import * as TSL from 'three/tsl';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
window.THREE = Object.assign({}, W, { GLTFLoader });
window.TSL = Object.assign({}, TSL, { bloom });
window.GPU_MODE = true;
