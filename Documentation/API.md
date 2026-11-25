# API

## `loadPly(input, options?)`

Reads `.ply`, ASCII or binary and returns a promise of a `PlyLoadResult`.

`input` is the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files. Zip archives among them are opened.

It throws `PlyImportError` for input that isn't PLY.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `main` | the first .ply file | The .ply file to open, if several are given. |
| `upAxis` | 'y' | `'z'` turns a Z-up model to Y up. |
| `unitScale` | 1 | Metres per PLY unit. |
| `pointSize` | 2 | Point size in pixels, for files without faces. |

### `PlyLoadResult`

| Field | Type | Meaning |
| --- | --- | --- |
| `group` | `THREE.Group` | The model. |
| `header` | `PlyHeader` | The header: `format`, `elements` and `comments`. |
| `warnings` | `string[]` | Problems that didn't stop the import. |
| `stats` | object | Counts of meshes, triangles and the like. |

See the package's `index.d.ts` for every exported type and helper.
