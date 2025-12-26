export interface MockPin {
  id: number;
  image: string;
  title: string;
  location: string;
  description: string;
  author: string;
  authorAvatar: string;
  coords: [number, number];
  likes?: number;
}

export interface MockCollection {
  id: number;
  title: string;
  image: string;
  pinCount: number;
  author: string;
  authorAvatar: string;
  isPrivate: boolean;
  likes?: number;
}

export const mockPins: MockPin[];
export const mockCollections: MockCollection[];

export function getPinById(id: string | number): MockPin | undefined;
export function getAllPins(): MockPin[];
export function getCollectionById(id: string | number): MockCollection | undefined;
export function getCollectionPins(collectionId: string | number): MockPin[];
