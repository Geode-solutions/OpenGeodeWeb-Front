// The route of a request to a microservice, such as "/opengeodeweb_back/upload_file"
type Route = string;

// The HTTP status code of a response
type StatusCode = number;

// A network port a microservice listens on
type Port = number;

// The version of a package or of an extension, such as "1.2.3"
type PackageVersion = string;

// The name of the application, as displayed to the user
type AppName = string;

// The token that authenticates the user to the cloud
type AuthToken = string;

// The name of an extension, as its manifest gives it
type ExtensionName = string;

// The name of a package, such as "opengeodeweb-back"
type PackageName = string;

export type {
  AppName,
  AuthToken,
  ExtensionName,
  PackageName,
  PackageVersion,
  Port,
  Route,
  StatusCode,
};
