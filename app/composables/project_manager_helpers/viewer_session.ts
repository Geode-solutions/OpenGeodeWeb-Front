import type { useViewerStore } from "@ogw_front/stores/viewer";

type ViewerClient = ReturnType<typeof useViewerStore>["client"];

async function releaseViewerDatabase(client: ViewerClient): Promise<void> {
  if (
    client !== undefined &&
    client.getConnection !== undefined &&
    client.getConnection().getSession !== undefined
  ) {
    await client.getConnection().getSession().call("opengeodeweb_viewer.release_database", [{}]);
  }
}

async function importProjectToViewer(client: ViewerClient): Promise<void> {
  if (
    client !== undefined &&
    client.getConnection !== undefined &&
    client.getConnection().getSession !== undefined
  ) {
    await client.getConnection().getSession().call("opengeodeweb_viewer.import_project", [{}]);
  }
}

export { importProjectToViewer, releaseViewerDatabase };
