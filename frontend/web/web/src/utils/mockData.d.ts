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
