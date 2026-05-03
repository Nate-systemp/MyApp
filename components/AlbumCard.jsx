import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { C, F, S, R } from '../constants/Yin';

const APressable = Animated.createAnimatedComponent(Pressable);

function MemoryThumb({ memory, onOpen }) {
  const sc = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));

  return (
    <APressable
      style={[styles.gridItem, aStyle]}
      onPressIn={() => { sc.value = withSpring(0.94, { damping: 14, stiffness: 220 }); }}
      onPressOut={() => { sc.value = withSpring(1, { damping: 12, stiffness: 180 }); }}
      onPress={(e) => {
        e.stopPropagation();
        setTimeout(() => onOpen?.(memory), 85);
      }}
    >
      <Image source={{ uri: memory.photo_url }} style={styles.image} />
    </APressable>
  );
}

export default function AlbumCard({ album, onPress, onMemoryPress }) {
  const previewImages = album.memories?.slice(0, 4) || [];
  const count = album.count || 0;

  return (
    <View style={styles.card}>
      <View style={styles.preview}>
        {previewImages.length > 0 ? (
          <View style={styles.grid}>
            {previewImages.map((memory, idx) => (
              <MemoryThumb key={idx} memory={memory} onOpen={onMemoryPress} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyPreview}>
            <View style={styles.emptyGlyph} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{album.name}</Text>
        <Text style={styles.count}>{count} {count === 1 ? 'photo' : 'photos'}</Text>
        <Text style={styles.helper}>Tap a photo to open it</Text>
        <Pressable style={({ pressed }) => [styles.openAlbumBtn, pressed && styles.openAlbumBtnPressed]} onPress={onPress}>
          <Text style={styles.openAlbumText}>Open album</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.bg,
    borderRadius: R.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: C.fill,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    height: '50%',
    padding: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: C.bgSecondary,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.fill,
  },
  emptyGlyph: {
    width: 46,
    height: 34,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.sepStrong,
    backgroundColor: C.bg,
  },
  info: {
    padding: S.md,
    gap: S.xs,
  },
  title: {
    fontSize: F.md,
    fontWeight: F.bold,
    color: C.label,
  },
  count: {
    fontSize: F.sm,
    color: C.label3,
  },
  helper: {
    fontSize: F.xs,
    color: C.label4,
  },
  openAlbumBtn: {
    marginTop: S.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.greenTint,
  },
  openAlbumBtnPressed: {
    opacity: 0.7,
  },
  openAlbumText: {
    color: C.greenDark,
    fontSize: F.xs,
    fontWeight: F.bold,
  },
});