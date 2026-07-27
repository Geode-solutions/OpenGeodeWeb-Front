function assertFile(file) {
  if (!(file instanceof File)) {
    throw new Error("file must be an instance of File");
  }
}
export { assertFile };