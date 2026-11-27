// The state of a microservice or of the viewer: created, connecting, connected...
type MicroserviceStatus = string;

interface StatusValues {
  NOT_CREATED: MicroserviceStatus;
  CREATING: MicroserviceStatus;
  CREATED: MicroserviceStatus;
  NOT_CONNECTED: MicroserviceStatus;
  CONNECTING: MicroserviceStatus;
  CONNECTED: MicroserviceStatus;
}

const Status: StatusValues = {
  NOT_CREATED: "NOT_CREATED",
  CREATING: "CREATING",
  CREATED: "CREATED",
  NOT_CONNECTED: "NOT_CONNECTED",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
};

export { Status };
export type { MicroserviceStatus };
