import { ExcalidrawApp, StorageProvider } from "excalidraw-with-storage";
import { Client, Databases, Storage, ID, Query } from "appwrite";

// Crude workaround since appwrite restricts fileId to 36 characters
async function shortenId(originalId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(originalId);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.slice(0, 36); // Ensure 36-character limit
}

class AppwriteStorageProvider implements StorageProvider {
  private client: Client;
  private database: Databases;
  private storage: Storage;
  private databaseId: string;
  private collectionId: string;
  private bucketId: string;
  constructor() {
    this.client = new Client();
    this.databaseId = "67a853060033ea5514cc"; // Replace with your actual database ID
    this.collectionId = "67a8530f0018d688bc89"; // Replace with your actual collection ID
    this.bucketId = "67a853c6001ae76f4a4d"; // Replace with your actual bucket ID

    this.client.setEndpoint("http://localhost:3000/v1").setProject("67a852420032cd164b12");

    this.database = new Databases(this.client);
    this.storage = new Storage(this.client);
  }
  fetchRecord = async (roomId: string): Promise<{ id: string; ciphertext: ArrayBuffer; iv: Uint8Array } | null | undefined> => {
    try {
      const response = await this.database.listDocuments(this.databaseId, this.collectionId, [Query.equal("roomId", roomId)]);

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        return {
          id: doc.$id,
          ciphertext: JSON.parse(doc.ciphertext), // Convert back to array
          iv: JSON.parse(doc.iv), // Convert back to array
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
      await this.database.updateDocument(this.databaseId, this.collectionId, id, {
        ...data,
        ciphertext: JSON.stringify(data.ciphertext), // Convert to string before storing
        iv: JSON.stringify(data.iv), // Convert to string before storing
      });
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };
  createRecord = async (data: { roomId: string; sceneVersion: number; ciphertext: number[]; iv: number[] }): Promise<void> => {
    try {
      await this.database.createDocument(this.databaseId, this.collectionId, ID.unique(), {
        ...data,
        ciphertext: JSON.stringify(data.ciphertext), // Convert to string before storing
        iv: JSON.stringify(data.iv), // Convert to string before storing
      });
    } catch (error) {
      console.error("Error creating record:", error);
    }
  };
  saveFile = async (_prefix: string, id: string, blob: Blob): Promise<void> => {
    try {
      const shortenedId = await shortenId(id);
      const file = new File([blob], shortenedId, { type: blob.type });
      await this.storage.createFile(this.bucketId, shortenedId, file);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  getFileUrl = async (_prefix: string, id: string): Promise<string | null> => {
    try {
      const shortenedId = await shortenId(id);

      return this.storage.getFileView(this.bucketId, shortenedId);
    } catch (error) {
      console.error("Error fetching file URL:", error);
      return null;
    }
  };
}

const storageProvider = new AppwriteStorageProvider();

function WithAppwrite() {
  return (
    <>
      <ExcalidrawApp storageProvider={storageProvider} excalidraw={{ aiEnabled: false }} collabServerUrl="http://localhost:3002" />
    </>
  );
}

export default WithAppwrite;
