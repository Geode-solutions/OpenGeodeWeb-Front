import _ from 'lodash'

import vtkWSLinkClient from '@kitware/vtk.js/IO/Core/WSLinkClient'
import SmartConnect from 'wslink/src/SmartConnect'

import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry'
import { connectImageStream } from '@kitware/vtk.js/Rendering/Misc/RemoteView'
import protocols from '@/protocols'

// Bind vtkWSLinkClient to our SmartConnect
vtkWSLinkClient.setSmartConnectClass(SmartConnect);


export const use_websocket_store = defineStore('websocket', {
  state: () => ({
    client: {},
    config: null,
    request_counter: 0,
    is_running: false
  }),
  getters: {
    base_url: () => {
      const cloud_store = use_cloud_store()
      const public_runtime_config = useRuntimeConfig().public
      var viewer_url = `${public_runtime_config.VIEWER_PROTOCOL}://${public_runtime_config.API_URL}:${public_runtime_config.VIEWER_PORT}`
      if (process.env.NODE_ENV == 'production') {
        viewer_url += `/${cloud_store.ID}/viewer`
      }
      viewer_url += '/ws'
      return viewer_url
    },
    is_busy: (state) => {
      return state.request_counter > 0
    }
  },
  actions: {
    ws_connect () {
      const config = { application: 'cone' };
      config.sessionURL = this.base_url

      const { client } = this
      if (this.is_running && client.isConnected()) {
        client.disconnect(-1);
        this.is_running = false;
      }
      let clientToConnect = client;
      if (_.isEmpty(clientToConnect)) {
        clientToConnect = vtkWSLinkClient.newInstance({ protocols });
      }

      // Connect to busy store
      clientToConnect.onBusyChange((count) => {
        this.buzy = count
      });
      clientToConnect.beginBusy();

      // Error
      clientToConnect.onConnectionError((httpReq) => {
        const message =
          (httpReq && httpReq.response && httpReq.response.error) ||
          `Connection error`;
        console.error(message);
        console.log(httpReq);
      });

      // Close
      clientToConnect.onConnectionClose((httpReq) => {
        const message =
          (httpReq && httpReq.response && httpReq.response.error) ||
          `Connection close`;
        console.error(message);
        console.log(httpReq);
      });

      // Connect
      clientToConnect
        .connect(config)
        .then((validClient) => {
          connectImageStream(validClient.getConnection().getSession());
          this.client = validClient
          clientToConnect.endBusy();

          // Now that the client is ready let's setup the server for us
          this.ws_initialize_server()
          this.client.getRemote().vtk.reset().catch(console.error);
          this.is_running = true;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    ws_initialize_server () {
      if (!_.isEmpty(this.client)) {
        this.client
          .getRemote()
          .vtk.create_visualization()
          .catch(console.error);
      }
    },
    reset_camera () {
      if (!_.isEmpty(this.client)) {
        this.client.getRemote().vtk.reset_camera().catch(console.error);
      }
    },
    start_request () {
      this.request_counter++
    },
    stop_request () {
      this.request_counter--
    }
  }
})