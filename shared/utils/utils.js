function getFileExtension(filename) {
    return filename.slice(filename.lastIndexOf(".") + 1);
}

export { getFileExtension };