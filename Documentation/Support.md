# Formats and support

mc-ply-import reads PLY with three.js's PLYLoader.

## What is read

- Vertices with normals, colours and texture coordinates; faces of any size.
- Files without faces, such as scans, as THREE.Points.
- The header: format, elements, properties and comments.

## Orientation and units

PLY has no units or up axis. The model is left as it is unless you pass `upAxis: 'z'` or `unitScale`.

## Limits

Elements other than vertices and faces are not read, with a warning.
