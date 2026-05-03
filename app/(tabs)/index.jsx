import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, StatusBar, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, Easing,
} from 'react-native-reanimated';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';
import AlbumGrid from '../../components/AlbumGrid';
import UploadSheet from '../../components/UploadSheet';
import ProfileModal from '../../components/ProfileModal';
import { C, F, R, S, shadow } from '../../constants/Yin';

const AView = Animated.createAnimatedComponent(View);
const APressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [groupMode] = useState('month');
  const [contentFilter, setContentFilter] = useState('all');
  const [openingAlbum, setOpeningAlbum] = useState(false);

  const [memories, setMemories] = useState([]);

  const op = useSharedValue(0);
  const heroY = useSharedValue(18);
  const statsY = useSharedValue(24);
  const filtersY = useSharedValue(30);
  const latestY = useSharedValue(36);
  const heroOp = useSharedValue(0);
  const statsOp = useSharedValue(0);
  const filtersOp = useSharedValue(0);
  const latestOp = useSharedValue(0);
  const fabOpacity = useSharedValue(1);
  const fabTranslateY = useSharedValue(0);
  const lastScrollY = useRef(0);
  useEffect(() => {
    op.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    heroY.value = withDelay(40, withSpring(0, { damping: 14, stiffness: 120 }));
    statsY.value = withDelay(110, withSpring(0, { damping: 14, stiffness: 120 }));
    filtersY.value = withDelay(170, withSpring(0, { damping: 14, stiffness: 120 }));
    latestY.value = withDelay(230, withSpring(0, { damping: 14, stiffness: 120 }));
    heroOp.value = withDelay(40, withTiming(1, { duration: 380 }));
    statsOp.value = withDelay(110, withTiming(1, { duration: 380 }));
    filtersOp.value = withDelay(170, withTiming(1, { duration: 380 }));
    latestOp.value = withDelay(230, withTiming(1, { duration: 420 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot mount fade-in
  }, []);
  const aStyle = useAnimatedStyle(() => ({ opacity: op.value }));
  const heroAnimStyle = useAnimatedStyle(() => ({
    opacity: heroOp.value,
    transform: [{ translateY: heroY.value }],
  }));
  const statsAnimStyle = useAnimatedStyle(() => ({
    opacity: statsOp.value,
    transform: [{ translateY: statsY.value }],
  }));
  const filtersAnimStyle = useAnimatedStyle(() => ({
    opacity: filtersOp.value,
    transform: [{ translateY: filtersY.value }],
  }));
  const latestAnimStyle = useAnimatedStyle(() => ({
    opacity: latestOp.value,
    transform: [{ translateY: latestY.value }],
  }));
  const latestCardScale = useSharedValue(1);
  const latestCardOpenY = useSharedValue(0);
  const latestCardOpenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: latestCardScale.value }, { translateY: latestCardOpenY.value }],
  }));

  const fabSc = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    opacity: fabOpacity.value,
    transform: [{ scale: fabSc.value }, { translateY: fabTranslateY.value }],
  }));

  const fetchMemories = useCallback(async () => {
    const { data, error } = await supabase
      .from('memories').select('*').order('created_at', { ascending: false });
    if (!error && data) setMemories(data);
  }, []);



  useEffect(() => {
    fetchMemories();

    const channel = supabase
      .channel('memories_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, () => {
        fetchMemories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMemories]);

  const firstName = 'ADI';
  const favoritesCount = memories.filter((item) => item.liked).length;

  const filteredMemories = useMemo(() => (
    contentFilter === 'favorites' ? memories.filter((item) => item.liked) : memories
  ), [contentFilter, memories]);

  const latestMemory = filteredMemories[0] ?? null;

  const openMemory = (item) =>
    router.push({ pathname: '/memory/[id]', params: { id: item.id, item: JSON.stringify(item) } });

  const openAlbum = (album) =>
    router.push({
      pathname: '/album/[id]',
      params: { id: album.id, album: JSON.stringify(album), mode: groupMode },
    });

  const handleOpenLatestAlbum = () => {
    if (!albums[0] || openingAlbum) return;
    setOpeningAlbum(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    latestCardScale.value = withTiming(1.05, { duration: 160, easing: Easing.out(Easing.cubic) });
    latestCardOpenY.value = withTiming(-8, { duration: 160, easing: Easing.out(Easing.cubic) });
    setTimeout(() => {
      openAlbum(albums[0]);
      latestCardScale.value = 1;
      latestCardOpenY.value = 0;
      setOpeningAlbum(false);
    }, 170);
  };

  const albums = useMemo(() => {
    const grouped = filteredMemories.reduce((acc, memory) => {
      const rawDate = memory.created_at ? new Date(memory.created_at) : new Date();
      const validDate = Number.isNaN(rawDate.getTime()) ? new Date() : rawDate;

      let key;
      let name;
      if (groupMode === 'week') {
        const day = validDate.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(validDate);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(validDate.getDate() + mondayOffset);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        key = weekStart.toISOString().slice(0, 10);
        const startText = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endText = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        name = `${startText} - ${endText}`;
      } else {
        const year = validDate.getFullYear();
        const month = String(validDate.getMonth() + 1).padStart(2, '0');
        key = `${year}-${month}`;
        name = validDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      if (!acc[key]) {
        acc[key] = { id: key, name, count: 0, memories: [] };
      }
      acc[key].memories.push(memory);
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.id.localeCompare(a.id));
  }, [filteredMemories, groupMode]);

  const handleGridScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const goingDown = y > lastScrollY.current + 8;
    const goingUp = y < lastScrollY.current - 8;
    if (goingDown && y > 80) {
      fabOpacity.value = withTiming(0, { duration: 160 });
      fabTranslateY.value = withTiming(24, { duration: 160 });
    } else if (goingUp) {
      fabOpacity.value = withTiming(1, { duration: 200 });
      fabTranslateY.value = withTiming(0, { duration: 200 });
    }
    lastScrollY.current = y;
  };



  const ListHeader = (
    <AView style={aStyle}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topRow}>
          <Text style={styles.brandTitle}>Yin</Text>
          <Pressable
            onPress={() => setProfileVisible(true)}
            style={({ pressed }) => [styles.profileBtn, pressed && styles.profileBtnPressed]}
            hitSlop={10}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(firstName[0] ?? '?').toUpperCase()}
              </Text>
            </View>
          </Pressable>
        </View>

        <AView style={[styles.heroBlock, heroAnimStyle]}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.welcomeText}>I lawb u,</Text>
            <Text style={styles.userName}>{firstName}</Text>
            <View style={styles.captureRow}>
              <Text style={styles.captureText}>Capture life, keep memories</Text>
              <View style={styles.pinkHeart} />
            </View>
          </View>
          <View style={styles.leafWrap}>
            <View style={styles.leafLarge} />
            <View style={styles.leafSmall} />
            <View style={styles.leafDot} />
          </View>
        </AView>

        <AView style={[styles.statsRow, statsAnimStyle]}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>MEMORIES</Text>
            <Text style={styles.statValue}>{memories.length}</Text>
            <Text style={styles.statHint}>Keep capturing</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>FAVORITES</Text>
            <Text style={styles.statValue}>{favoritesCount}</Text>
            <Text style={styles.statHint}>Your favorites</Text>
          </View>
        </AView>

        <AView style={[styles.filterTabs, filtersAnimStyle]}>
          <Pressable
            style={[styles.filterTabBtn, contentFilter === 'all' && styles.filterTabBtnActive]}
            onPress={() => setContentFilter('all')}
            android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
          >
            <Text style={[styles.filterTabText, contentFilter === 'all' && styles.filterTabTextActive]}>All</Text>
          </Pressable>
          <Pressable
            style={[styles.filterTabBtn, contentFilter === 'favorites' && styles.filterTabBtnActive]}
            onPress={() => setContentFilter('favorites')}
            android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
          >
            <Text style={[styles.filterTabText, contentFilter === 'favorites' && styles.filterTabTextActive]}>Favorites</Text>
          </Pressable>
        </AView>

        <AView style={[styles.latestCard, latestAnimStyle, latestCardOpenStyle]}>
          <View style={styles.latestHeaderRow}>
            <View>
              <Text style={styles.latestTitle}>Latest Memory</Text>
              <Text style={styles.latestSubtitle}>your most recent capture</Text>
            </View>
            <Pressable
              disabled={openingAlbum}
              onPress={handleOpenLatestAlbum}
              style={({ pressed }) => [
                styles.viewAllBtn,
                pressed && styles.viewAllBtnPressed,
                openingAlbum && styles.viewAllBtnDisabled,
              ]}
            >
              <Text style={styles.viewAllText}>open latest album {'>'}</Text>
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [styles.latestPreview, pressed && styles.latestPreviewPressed]}
            onPress={() => {
              if (latestMemory) openMemory(latestMemory);
            }}
          >
            {latestMemory?.photo_url ? (
              <Image source={{ uri: latestMemory.photo_url }} style={styles.latestImage} />
            ) : (
              <View style={styles.latestPlaceholder}>
                <Text style={styles.latestPlaceholderText}>No photo yet</Text>
              </View>
            )}
          </Pressable>
        </AView>
      </View>
    </AView>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <AlbumGrid
        albums={albums}
        onAlbumPress={openAlbum}
        onMemoryPress={(memory) => {
          if (memory) openMemory(memory);
        }}
        onScroll={handleGridScroll}
        ListHeader={ListHeader}
      />

      <APressable
        style={[styles.fab, { bottom: insets.bottom + 24 }, fabStyle]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          sheetRef.current?.expand();
        }}
        onPressIn={() => {
          Haptics.selectionAsync();
          fabSc.value = withSpring(0.92, { damping: 12 });
        }}
        onPressOut={() => { fabSc.value = withSpring(1, { damping: 10 }); }}
      >
        <View style={styles.fabPlus}>
          <Text style={styles.fabPlusText}>+</Text>
        </View>
        <Text style={styles.fabLabel}>New Memory</Text>
      </APressable>

      <UploadSheet ref={sheetRef} onUploaded={() => { fetchMemories(); }} />
      <ProfileModal 
        visible={profileVisible} 
        onClose={() => setProfileVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingHorizontal: 0,
    paddingBottom: S.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: S.md,
  },
  brandTitle: {
    fontSize: F.xxl,
    fontWeight: F.black,
    color: C.label,
    letterSpacing: -0.4,
  },
  profileBtn: {
    padding: 0,
  },
  profileBtnPressed: {
    opacity: 0.75,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  avatarText: {
    color: '#fff',
    fontSize: F.lg,
    fontWeight: F.bold,
  },
  heroBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: S.md,
  },
  heroTextBlock: {
    gap: 2,
    flex: 1,
  },
  welcomeText: {
    fontSize: F.sm,
    fontWeight: F.semibold,
    color: C.label3,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 34,
    fontWeight: F.black,
    color: C.label,
    letterSpacing: -1,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  captureText: {
    fontSize: F.sm,
    color: C.label3,
  },
  pinkHeart: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF8FB1',
  },
  leafWrap: {
    width: 88,
    height: 74,
    position: 'relative',
    marginLeft: S.md,
  },
  leafLarge: {
    position: 'absolute',
    right: 4,
    bottom: 8,
    width: 58,
    height: 34,
    borderRadius: 24,
    backgroundColor: '#D9F2E8',
    transform: [{ rotate: '-22deg' }],
  },
  leafSmall: {
    position: 'absolute',
    right: 24,
    bottom: 28,
    width: 40,
    height: 24,
    borderRadius: 20,
    backgroundColor: '#EAF9F2',
    transform: [{ rotate: '-38deg' }],
  },
  leafDot: {
    position: 'absolute',
    right: 0,
    top: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#B9E7D3',
  },
  statsRow: {
    flexDirection: 'row',
    gap: S.sm,
    marginBottom: S.md,
    
  },
  filterTabs: {
    flexDirection: 'row',
    gap: S.sm,
    marginBottom: S.md,
  },
  filterTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.bgSecondary,
  },
  filterTabBtnActive: {
    backgroundColor: C.greenTint,
  },
  filterTabText: {
    color: C.label3,
    fontSize: F.xs,
    fontWeight: F.semibold,
  },
  filterTabTextActive: {
    color: C.greenDark,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.bg,
    
    borderRadius: R.lg,
    padding: S.md,
    ...shadow.sm,
  },
  statLabel: {
    fontSize: 11,
    color: C.label4,
    fontWeight: F.bold,
    letterSpacing: 0.6,
  },
  statValue: {
    marginTop: 2,
    fontSize: F.xxl,
    color: C.green,
    fontWeight: F.black,
    letterSpacing: -0.4,
  },
  statHint: {
    marginTop: 2,
    fontSize: F.xs,
    color: C.label3,
  },
  latestCard: {
    backgroundColor: C.bgSecondary,
    borderRadius: R.xl,
    padding: S.md,
    marginBottom: S.sm,
  },
  latestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: S.sm,
  },
  latestTitle: {
    fontSize: F.lg,
    fontWeight: F.bold,
    color: C.label,
  },
  latestSubtitle: {
    fontSize: F.xs,
    color: C.label3,
    marginTop: 2,
  },
  viewAllText: {
    color: C.green,
    fontSize: F.xs,
    fontWeight: F.semibold,
  },
  viewAllBtn: {
    paddingVertical: 4,
  },
  viewAllBtnPressed: {
    opacity: 0.6,
  },
  viewAllBtnDisabled: {
    opacity: 0.45,
  },
  latestPreview: {
    borderRadius: R.lg,
    overflow: 'hidden',
    height: 148,
    backgroundColor: C.fill,
    position: 'relative',
  },
  latestPreviewPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  latestImage: {
    width: '100%',
    height: '100%',
  },
  latestPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.fill,
  },
  latestPlaceholderText: {
    color: C.label3,
    fontSize: F.sm,
  },
  fab: {
    position: 'absolute',
    right: S.xl,
    height: 58,
    borderRadius: 29,
    paddingHorizontal: 10,
    backgroundColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  fabPlus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fabPlusText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: F.bold,
    lineHeight: 26,
  },
  fabLabel: {
    color: '#fff',
    fontSize: F.md,
    fontWeight: F.bold,
    paddingRight: 8,
  },
});