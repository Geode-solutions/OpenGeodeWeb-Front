// The name of a file, with its extension and without its directory
type FileName = string;

// A path to a file or a directory, relative to the project or to the server data folder
type FilePath = string;

// The extension of a file, without its dot
type FileExtension = string;

// The media type of a file, such as "text/csv"
type MimeType = string;

// An address of a resource or a server
type Url = string;

// A file the user picked for upload, with what the upload dialogs record about it
type UploadFile = File & { isConfigured?: boolean; displayName?: string; relativePath?: string };

export type { FileExtension, FileName, FilePath, MimeType, UploadFile, Url };
