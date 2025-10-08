import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { browser } from '$app/environment';

interface PoetryCollageDB extends DBSchema {
  materials: {
    key: number;
    value: {
      id: number;
      text: string;
      imageBlob: Blob;
      createdAt: Date;
    };
    indexes: { 'createdAt': Date };
  };
}

export type Material = Omit<PoetryCollageDB['materials']['value'], 'id'>;
export type StoredMaterial = PoetryCollageDB['materials']['value'];

const DB_NAME = 'PoetryCollageDB';
const DB_VERSION = 1;
const STORE_NAME = 'materials';

let dbPromise: Promise<IDBPDatabase<PoetryCollageDB>> | null = null;

function getDB() {
  if (!browser) {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<PoetryCollageDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function addMaterial(material: Material): Promise<number | undefined> {
  const db = getDB();
  if (!db) return;

  const dbInstance = await db;
  return dbInstance.add(STORE_NAME, { ...material, createdAt: new Date() } as any);
}

export async function getAllMaterials(): Promise<StoredMaterial[]> {
  const db = getDB();
  if (!db) return [];

  const dbInstance = await db;
  return dbInstance.getAll(STORE_NAME);
}

export async function clearAllMaterials(): Promise<void> {
  const db = getDB();
  if (!db) return;
  const dbInstance = await db;
  await dbInstance.clear(STORE_NAME);
}