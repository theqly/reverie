import CollectionGridItem from './CollectionGridItem';
import styles from './CollectionGridItem.module.css';

interface Collection {
  id: string | number;
  image?: string;
  title: string;
  location?: string;
  pinsCount?: number;
}

interface CollectionGridProps {
  collections: Collection[];
  onCollectionClick: (id: string | number) => void;
}

const CollectionGrid = ({ collections, onCollectionClick }: CollectionGridProps) => {
  return (
    <div className={styles.collectionsGrid}>
      {collections.map(collection => (
        <CollectionGridItem 
          key={collection.id} 
          collection={collection} 
          onClick={() => onCollectionClick(collection.id)}
        />
      ))}
    </div>
  );
};

export default CollectionGrid;