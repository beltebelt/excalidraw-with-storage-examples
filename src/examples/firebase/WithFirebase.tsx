import { ExcalidrawApp, StorageProvider } from "excalidraw-with-storage";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

class FirebaseStorageProvider implements StorageProvider {
  private db: ReturnType<typeof getFirestore>;
  private storage: ReturnType<typeof getStorage>;

  constructor() {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: "<<YOUR_API_KEY>>",
      authDomain: "<<YOUR_AUTH_DOMAIN>>",
      projectId: "<<YOUR_PROJECT_ID>>",
      storageBucket: "<<YOUR_STORAGE_BUCKET>>",
      messagingSenderId: "<<YOUR_MESSAGING_SENDER_ID>>",
      appId: "<<YOUR_APP_ID>>",
    };
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.storage = getStorage(app);
  }

  fetchRecord = async (roomId: string): Promise<{ id: string; ciphertext: ArrayBuffer; iv: Uint8Array } | null | undefined> => {
    try {
      const scenesRef = collection(this.db, "scenes");
      const q = query(scenesRef, where("roomId", "==", roomId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const record = querySnapshot.docs[0].data();
        return {
          id: querySnapshot.docs[0].id,
          ciphertext: record.ciphertext,
          iv: record.iv,
        };
      }
      return null; // Record doesn't exist
    } catch (error) {
      console.error("Error fetching record:", error);
      return undefined;
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
      const { roomId, sceneVersion, ciphertext, iv } = data;
      const sceneRef = doc(this.db, "scenes", id);
      await updateDoc(sceneRef, {
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
      const scenesRef = collection(this.db, "scenes");
      await setDoc(doc(scenesRef), {
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
      const storageRef = ref(this.storage, `${prefix}/${id}`);
      await uploadBytes(storageRef, blob);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  getFileUrl = async (prefix: string, id: string): Promise<string | null> => {
    try {
      const storageRef = ref(this.storage, `${prefix}/${id}`);
      const url = await getDownloadURL(storageRef);
      console.log(url);
      return url;
    } catch (error) {
      console.error("Error fetching file URL:", error);
      return null;
    }
  };
}
const storageProvider = new FirebaseStorageProvider();

function WithFirebase() {
  return (
    <>
      <ExcalidrawApp storageProvider={storageProvider} excalidraw={{ aiEnabled: false }} collabServerUrl="http://localhost:3002" />
    </>
  );
}

export default WithFirebase;
