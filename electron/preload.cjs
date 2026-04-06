const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("perfoDesktop", {
  platform: "electron",
});
