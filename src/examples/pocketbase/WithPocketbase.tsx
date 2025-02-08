import { ExcalidrawApp, StorageProvider } from "excalidraw-with-storage";
import PocketBase from "pocketbase";

class PocketbaseStorageProvider implements StorageProvider {
  private pb: PocketBase;
  private pbEndpoint: string;
  constructor() {
    this.pbEndpoint = "http://localhost:8090";
    this.pb = new PocketBase(this.pbEndpoint);
  }
  fetchRecord = async (roomId: string): Promise<{ id: string; ciphertext: ArrayBuffer; iv: Uint8Array } | null | undefined> => {
    let record: { id: string; ciphertext: ArrayBuffer; iv: Uint8Array } | null | undefined;
    try {
      const records = await this.pb.collection("scenes").getFullList({ filter: `roomId="${roomId}"` });
      if (records.length > 0) {
        record = {
          id: records[0].id,
          ciphertext: records[0].ciphertext,
          iv: records[0].iv,
        };
      }
    } catch {
      // Record doesn't exist, create new
      record = null;
    }
    return record;
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
      const { roomId, sceneVersion, ciphertext, iv } = data;
      await this.pb.collection("scenes").update(id, {
        roomId,
        sceneVersion,
        ciphertext,
        iv,
        roomKey: null,
      });
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };
  createRecord = async (data: { roomId: string; sceneVersion: number; ciphertext: number[]; iv: number[] }): Promise<void> => {
    try {
      const { roomId, sceneVersion, ciphertext, iv } = data;
      await this.pb.collection("scenes").create({
        roomId,
        sceneVersion,
        ciphertext,
        iv,
        roomKey: null,
      });
    } catch (error) {
      console.error("Error creating record:", error);
    }
  };
  saveFile = async (prefix: string, id: string, blob: Blob): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("ref", `${prefix}/${id}`);
      formData.append("file", blob, id);

      await this.pb.collection("files").create(formData);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  getFileUrl = async (prefix: string, id: string): Promise<string | null> => {
    try {
      const file = await this.pb.collection("files").getFullList({ filter: `ref="/${prefix}/${id}"` });
      if (file.length !== 0) {
        return `${this.pbEndpoint}/api/files/files/${file[0].id}/${file[0].file}`;
      }
      return null;
    } catch (error) {
      console.error("Error fetching file URL:", error);
      return null;
    }
  };
}

const storageProvider = new PocketbaseStorageProvider();

function WithPocketbase() {
  return (
    <>
      <ExcalidrawApp storageProvider={storageProvider} excalidraw={{ aiEnabled: false }} collabServerUrl="http://localhost:3002" />
    </>
  );
}

export default WithPocketbase;
