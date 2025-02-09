import { ExcalidrawApp, StorageProvider } from "excalidraw-with-storage";
import { createDirectus, createItem, DirectusClient, readFiles, readItems, rest, updateItem, uploadFiles } from "@directus/sdk";

class DirectusStorageProvider implements StorageProvider {
  private directus: DirectusClient<any>;
  private directusEndpoint: string;

  constructor() {
    this.directusEndpoint = "http://localhost:8055";
    this.directus = createDirectus(this.directusEndpoint).with(rest());
  }
  fetchRecord = async (roomId: string): Promise<{ id: string; ciphertext: ArrayBuffer; iv: Uint8Array } | null | undefined> => {
    try {
      // @ts-ignore
      const records = await this.directus.request(
        // @ts-ignore
        readItems("scenes", {
          filter: { roomId: { _eq: roomId } },
          limit: 1,
        })
      );

      if (records && records.length > 0) {
        return {
          id: records[0].id,
          ciphertext: records[0].ciphertext,
          iv: records[0].iv,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching record:", error);
      return null;
    }
  };
  updateRecord = async (
    id: string,
    data: {
      roomId: string;
      sceneVersion: number;
      ciphertext: number[];
      iv: number[];
    }
  ): Promise<void> => {
    try {
      // @ts-ignore
      await this.directus.request(updateItem("scenes", id, data));
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };
  createRecord = async (data: { roomId: string; sceneVersion: number; ciphertext: number[]; iv: number[] }): Promise<void> => {
    try {
      // const { roomId, sceneVersion, ciphertext, iv } = data;
      // @ts-ignore
      await this.directus.request(createItem("scenes", data));
    } catch (error) {
      console.error("Error creating record:", error);
    }
  };
  saveFile = async (_prefix: string, id: string, blob: Blob): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("file", blob, id);
      // @ts-ignore
      await this.directus.request(uploadFiles(formData));
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  getFileUrl = async (_prefix: string, id: string): Promise<string | null> => {
    try {
      // @ts-ignore
      const file = await this.directus.request(readFiles({ filter: { filename_download: { _eq: id } } }));
      return `${this.directusEndpoint}/assets/${file[0].id}`;
    } catch (error) {
      console.error("Error fetching file URL:", error);
      return null;
    }
  };
}

const storageProvider = new DirectusStorageProvider();

function WithDirectus() {
  return (
    <>
      <ExcalidrawApp storageProvider={storageProvider} excalidraw={{ aiEnabled: false }} collabServerUrl="http://localhost:3002" />
    </>
  );
}

export default WithDirectus;
