# mc-ply-import

A PLY importer for [three.js](https://threejs.org/), written in TypeScript. It reads Stanford PLY files, ASCII or binary in either byte order, as meshes, or as point clouds when they have no faces, with their normals, colours and texture coordinates. It was made for [SceneEditor](https://github.com/VJigouline/SceneEditor), and works in any three.js application.

```ts
import { loadPly } from 'mc-ply-import';

const result = await loadPly(await file.arrayBuffer());
scene.add(result.group);
console.log(result.warnings);       // anything that couldn't be read
```

## What it reads

- Vertices with normals, colours and texture coordinates; faces of any size.
- Files without faces, such as scans, as THREE.Points.
- The header: format, elements, properties and comments.

Elements other than vertices and faces are not read, with a warning. See [Formats and support](Documentation/Support.md) for the details.

## Install

The package is not on the npm registry. Install it from GitHub:

```sh
npm install github:VJigouline/mc-ply-import
```

`three` (r160 or later) is a peer dependency. The package builds itself on install.

## Documentation

- [Getting started](Documentation/GettingStarted.md)
- [API](Documentation/API.md)
- [Formats and support](Documentation/Support.md)
- [Using it in SceneEditor](Documentation/SceneEditor.md)

## Development

```sh
npm install
npm test           # unit tests, with Vitest
npm run typecheck
npm run build      # dist/
```

The tests load real PLY files, kept in [`tests/samples`](tests/samples/README.md) with their licences. It needs Node.js 22 or later.

## Licence

[MIT](LICENSE)
