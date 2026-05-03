import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, StatusBar, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import MemoryCard from '../../components/MemoryCard';
import { supabase } from '../../supabase';
import { C, F, S } from '../../constants/Yin';

const AView = Animated.createAnimatedComponent(View);

export default function AlbumDetailScreen() {
  const { album: albumParam, mode } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [busyId, setBusyId] = useState(null);
  const enterScale = useSharedValue(0.96);
  const enterY = useSharedValue(22);
  const enterOp = useSharedValue(0);
  const enterStyle = useAnimatedStyle(() => ({
    opacity: enterOp.value,
    transform: [{ scale: enterScale.value }, { translateY: enterY.value }],
  }));

  const album = useMemo(() => {
    try {
      return JSON.parse(albumParam ?? '{}');
    } catch {
      return { id: 'unknown', name: 'Album', memories: [] };
    }
  }, [albumParam]);

  const memories = album?.memories ?? [];

  const openMemory = (item) => {
    router.push({ pathname: '/memory/[id]', params: { id: item.id, item: JSON.stringify(item) } });
  };

  const toggleLike = async (item) => {
    if (!item?.id || busyId) return;
    setBusyId(item.id);
    Haptics.selectionAsync();
    try {
      const { error } = await supabase
        .from('memories')
        .update({ liked: !item.liked })
        .eq('id', item.id);
      if (error) throw error;
      item.liked = !item.liked;
    } catch {
      // keep UI unchanged if write fails
    } finally {
      setBusyId(null);
    }
  };

  React.useEffect(() => {
    enterScale.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
    enterY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    enterOp.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return (
    <AView style={[styles.screen, enterStyle]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backCircle, pressed && styles.backCirclePressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>{album.name || 'Album'}</Text>
          <Text style={styles.subtitle}>
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} - {mode === 'week' ? 'Weekly' : 'Monthly'}
          </Text>
        </View>
      </View>

      <FlatList
        data={memories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <MemoryCard
            item={item}
            onPress={() => openMemory(item)}
            onLike={() => toggleLike(item)}
            disabled={busyId === item.id}
          />
        )}
      />
    </AView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    paddingHorizontal: S.xl,
    paddingBottom: S.md,
    gap: S.sm,
  },
  backCircle: {
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: C.label,
    lineHeight: 28,
    marginRight: 2,
  },
  backCirclePressed: {
    opacity: 0.7,
  },
  headerTextWrap: {
    gap: 2,
  },
  title: {
    fontSize: F.xxl,
    fontWeight: F.black,
    color: C.label,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: F.sm,
    color: C.label3,
  },
  list: {
    paddingHorizontal: S.xl,
    paddingBottom: 24,
  },
  row: {
    gap: S.md,
    marginBottom: S.md,
  },
});
