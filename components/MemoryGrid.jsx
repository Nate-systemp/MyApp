import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import MemoryCard from './MemoryCard';
import { C, F, S } from '../constants/Yin';

/**
 * MemoryGrid — 2-column grid of MemoryCards.
 */
export default function MemoryGrid({ memories, onOpen, onLike, ListHeader }) {
  return (
    <FlatList
      data={memories ?? []}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <View style={styles.empty}>
          {/* solid camera icon */}
          <View style={styles.emptyIcon}>
            <View style={styles.cameraBody}>
              <View style={styles.cameraLens} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>No memories yet</Text>
          <Text style={styles.emptyBody}>
            Tap the + button below to add{'\n'}your first moment together
          </Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <MemoryCard
          item={item}
          onPress={() => onOpen(item)}
          onLike={() => onLike(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: S.lg, paddingBottom: 120 },
  row: { gap: 12, marginBottom: 12 },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },

  /* solid camera icon — no emoji */
  emptyIcon: { marginBottom: S.lg },
  cameraBody: {
    width: 52,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.sepStrong,
  },
  cameraLens: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: C.sepStrong,
  },

  emptyTitle: {
    fontSize: F.xl,
    fontWeight: F.bold,
    color: C.label,
    letterSpacing: -0.5,
    marginBottom: S.sm,
  },
  emptyBody: {
    fontSize: F.sm,
    color: C.label3,
    textAlign: 'center',
    lineHeight: 20,
  },
});
