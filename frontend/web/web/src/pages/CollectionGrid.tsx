import React from 'react';
import CollectionGridItem from './CollectionGridItem';
import styles from './CollectionGridItem.module.css'; // или используй стили из Feed.module.css

const CollectionGrid = ({ collections, onCollectionClick }) => {
  return (
    <div className={styles.collectionsGrid}>
      {collections.map(collection => (
        <CollectionGridItem 
          key={collection.id} 
          collection={collection} 
          onClick={() => onCollectionClick(collection.id, collection.author, collection.ownerId)}
        />
      ))}
    </div>
  );
};

export default CollectionGrid;