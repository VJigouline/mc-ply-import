import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { loadPly, PlyImportError, readPlyHeader } from '../src/index.js';
import { sample } from './files.js';

describe('PLY', () => {
  it('reads ASCII and binary files of both byte orders alike', async () => {
    const counts = [];
    for (const name of ['dolphins.ply', 'dolphins_le.ply', 'dolphins_be.ply']) {
      const r = await loadPly(sample(name));
      counts.push(r.stats.triangles);
    }
    expect(counts).toEqual([1689, 1689, 1689]);
    expect((await loadPly(sample('dolphins_be.ply'))).header.format).toBe('binary_big_endian');
  });

  it('reads vertex colours', async () => {
    const r = await loadPly(sample('dolphins_colored.ply'));
    const mesh = r.group.children[0] as THREE.Mesh;
    expect(mesh.geometry.getAttribute('color')).toBeTruthy();
    expect((mesh.material as THREE.MeshStandardMaterial).vertexColors).toBe(true);
  });

  it('reads a file without faces as points', async () => {
    const text = 'ply\nformat ascii 1.0\nelement vertex 3\nproperty float x\nproperty float y\nproperty float z\nend_header\n0 0 0\n1 0 0\n0 1 0\n';
    const r = await loadPly(text);
    expect(r.group.children[0]).toBeInstanceOf(THREE.Points);
    expect(r.stats.points).toBe(3);
    expect(readPlyHeader(new TextEncoder().encode(text)).elements).toEqual([{ name: 'vertex', count: 3, properties: ['x', 'y', 'z'] }]);
  });

  it('refuses files that are not PLY', async () => {
    await expect(loadPly('hello')).rejects.toThrow(PlyImportError);
  });
});
