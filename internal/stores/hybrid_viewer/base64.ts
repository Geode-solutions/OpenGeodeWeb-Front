// Decodes a base64 string (the back's binary_light_viewable) into raw bytes for vtk.js readers.
// Uint8Array.fromBase64 would do this natively but is unavailable in Node 22, which runs the tests.
export function base64ToArrayBuffer(b64: string): ArrayBuffer {
  // Atob returns a "binary string": one char per byte, so each code point is the byte value.
  return Uint8Array.from(atob(b64), (char) => char.codePointAt(0) ?? 0).buffer;
}
