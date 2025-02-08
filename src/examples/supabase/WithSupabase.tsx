import { ExcalidrawApp, StorageProvider } from "excalidraw-with-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

class SupabaseStorageProvider implements StorageProvider {
  private supabase: SupabaseClient;
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  fetchRecord = async (roomId: string): Promise<{ id: string; ciphertext: ArrayBuffer; iv: Uint8Array } | null | undefined> => {
    try {
      const { data, error } = await this.supabase.from("scenes").select("id, ciphertext, iv").eq("roomId", roomId).single();
      if (error) throw error;
      return data ? { id: data.id, ciphertext: data.ciphertext, iv: data.iv } : null;
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
      const { error } = await this.supabase.from("scenes").update(data).eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };
  createRecord = async (data: { roomId: string; sceneVersion: number; ciphertext: number[]; iv: number[] }): Promise<void> => {
    try {
      const { error } = await this.supabase.from("scenes").insert(data);
      if (error) throw error;
    } catch (error) {
      console.error("Error creating record:", error);
    }
  };
  saveFile = async (prefix: string, id: string, blob: Blob): Promise<void> => {
    try {
      const { error } = await this.supabase.storage.from("files").upload(`${prefix}/${id}`, blob);
      if (error) throw error;
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  getFileUrl = async (prefix: string, id: string): Promise<string | null> => {
    try {
      const { data } = await this.supabase.storage.from("files").getPublicUrl(`${prefix}/${id}`);
      return data.publicUrl;
    } catch (error) {
      console.error("Error fetching file URL:", error);
      return null;
    }
  };
}

const storageProvider = new SupabaseStorageProvider("<<SUPABASE_URL>>", "<<SUPABASE_KEY>>");

function WithSupabase() {
  return (
    <>
      <ExcalidrawApp storageProvider={storageProvider} excalidraw={{ aiEnabled: false }} collabServerUrl="http://localhost:3002" />
    </>
  );
}

export default WithSupabase;
