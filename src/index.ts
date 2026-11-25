import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { countModel, ImportFiles, orient, type ImportInput, type ImportStats } from './common.js';

export { ImportFiles, countModel } from './common.js';
export type { ImportInput, ImportFile, ImportData, ImportStats } from './common.js';

export interface PlyOptions {
  /** The .ply file to open, if several are given. By default, the first. */
  main?: string;
  /** PLY has no up axis; the default is Y up. Use 'z' for Z-up scans and CAD output. */
  upAxis?: 'y' | 'z';
  /** Metres per PLY unit. PLY has no units; the default, 1, leaves the model as it is. */
  unitScale?: number;
  /** Size of points, in pixels, for files without faces. Default 2. */
  pointSize?: number;
}

export interface PlyHeader {
  format: 'ascii' | 'binary_little_endian' | 'binary_big_endian';
  /** Element names and counts, such as vertex and face. */
  elements: { name: string; count: number; properties: string[] }[];
  comments: string[];
}

export interface PlyLoadResult {
  /** The model: a mesh, or points for a file without faces, in a group named after the file. */
  group: THREE.Group;
  header: PlyHeader;
  warnings: string[];
  stats: ImportStats;
}

export class PlyImportError extends Error {
  override name = 'PlyImportError';
}

/** Reads the PLY header. */
export function readPlyHeader(bytes: Uint8Array): PlyHeader {
  const head = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 65536)));
  if (!head.startsWith('ply')) throw new PlyImportError('Not a PLY file: it does not start with "ply"');
  const end = head.indexOf('end_header');
  if (end < 0) throw new PlyImportError('The PLY header has no end_header');
  const header: PlyHeader = { format: 'ascii', elements: [], comments: [] };
  for (const line of head.slice(0, end).split(/\r?\n/)) {
    const [word, ...rest] = line.trim().split(/\s+/);
    if (word === 'format') header.format = rest[0] as PlyHeader['format'];
    else if (word === 'comment') header.comments.push(rest.join(' '));
    else if (word === 'element') header.elements.push({ name: rest[0]!, count: Number(rest[1]), properties: [] });
    else if (word === 'property') header.elements[header.elements.length - 1]?.properties.push(rest[rest.length - 1]!);
  }
  return header;
}

/** Reads a PLY file, ASCII or binary, into a mesh, or into points if it has no faces. */
export async function loadPly(input: ImportInput, options: PlyOptions = {}): Promise<PlyLoadResult> {
  const files = await ImportFiles.from(input, 'model.ply');
  const main = files.main(['ply'], options.main) ?? files.files[0];
  if (!main) throw new PlyImportError('There is no .ply file to open');
  const header = readPlyHeader(main.bytes);
  const warnings: string[] = [];
  const data = main.bytes.buffer.slice(main.bytes.byteOffset, main.bytes.byteOffset + main.bytes.byteLength) as ArrayBuffer;
  const geometry = new PLYLoader().parse(data);
  const faces = header.elements.find((e) => e.name === 'face')?.count ?? 0;
  const hasColors = !!geometry.getAttribute('color');
  let object: THREE.Object3D;
  const name = main.name.replace(/\\/g, '/').split('/').pop()!.replace(/\.ply$/i, '');
  if (faces > 0) {
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
    object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ name, color: hasColors ? 0xffffff : 0xcccccc, vertexColors: hasColors, roughness: 0.6, metalness: 0, side: THREE.DoubleSide }));
  } else {
    object = new THREE.Points(geometry, new THREE.PointsMaterial({ name, color: hasColors ? 0xffffff : 0x888888, vertexColors: hasColors, size: options.pointSize ?? 2, sizeAttenuation: false }));
  }
  object.name = name;
  geometry.computeBoundingSphere();
  if (header.elements.some((e) => !['vertex', 'face'].includes(e.name))) {
    warnings.push(`Elements other than vertices and faces are not read: ${header.elements.filter((e) => !['vertex', 'face'].includes(e.name)).map((e) => e.name).join(', ')}`);
  }
  const group = orient(object, name, options.upAxis === 'z', options.unitScale ?? 1);
  return { group, header, warnings, stats: countModel(group) };
}
