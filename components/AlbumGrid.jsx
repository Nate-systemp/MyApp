import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import AlbumCard from './AlbumCard';
import { C, F, S } from '../constants/Yin';

export default function AlbumGrid({
  albums,
  onAlbumPress,
  onMemoryPress,
  ListHeader,
  onScroll,
}) {
  const renderAlbum = ({ item }) => (
    <View style={styles.albumWrapper}>
      <AlbumCard
        album={item}
        onPress={() => onAlbumPress(item)}
        onMemoryPress={(memory) => onMemoryPress?.(memory)}
      />
    </View>
  );

  return (
    <FlatList
      data={albums}
      renderItem={renderAlbum}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={ListHeader}
      onScroll={onScroll}
      scrollEventThrottle={16}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No albums yet</Text>
          <Text style={styles.emptyBody}>Add your first memory to start your timeline.</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: S.xl,
    paddingBottom: 120,
  },
  row: {
    gap: S.md,
    marginBottom: S.md,
  },
  albumWrapper: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontSize: F.xl,
    color: C.label,
    fontWeight: F.bold,
    marginBottom: S.xs,
  },
  emptyBody: {
    color: C.label3,
    fontSize: F.sm,
    textAlign: 'center',
  },
});