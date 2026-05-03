import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withRepeat, withSequence, withSpring, Easing,
} from 'react-native-reanimated';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';
import YinMascot from '../../components/YinMascot';
import MemoryCard from '../../components/MemoryCard';
import MemoryGrid from '../../components/MemoryGrid';
import UploadSheet from '../../components/UploadSheet';
import { C, F, S, shadow } from '../../constants/Yin';

const AView = Animated.createAnimatedComponent(View);
const APressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef(null);

  const [memories, setMemories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  /* entrance */
  const op = useSharedValue(0);
  useEffect(() => {
    op.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, []);
  const aStyle = useAnimatedStyle(() => ({ opacity: op.value }));

  /* fab pulse */
  const fabSc = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabSc.value }] }));

  /* data */
  const fetchMemories = useCallback(async () => {
    const { data, error } = await supabase
      .from('memories').select('*').order('created_at', { ascending: false });
    if (!error && data) setMemories(data);
  }, []);

  useEffect(() => {
    fetchMemories();

    // ── REALTIME SUBSCRIPTION ──
    const channel = supabase
      .channel('memories_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, () => {
        fetchMemories(); // Refresh whenever anything changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMemories]);

  const firstName = user?.email?.split('@')[0] ?? 'there';
  const featured = memories[0];
  const gridMemories = memories.slice(1);

  const openMemory = (item) =>
    router.push({ pathname: '/memory/[id]', params: { id: item.id, item: JSON.stringify(item) } });

  const toggleLike = (item) =>
    setMemories(prev => prev.map(m => m.id === item.id ? { ...m, liked: !m.liked } : m));

  const ListHeader = (
    <AView style={aStyle}>
      {/* ── Nav bar ── */}
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.navLeft}>
          <Text style={styles.navTitle}>Yin</Text>
          <Text style={styles.navSub}>{memories.length} {memories.length === 1 ? 'memory' : 'memories'}</Text>
        </View>
        <View style={styles.navRight}>
          <YinMascot size={32} />
          <Pressable onPress={signOut} style={styles.avatarBtn}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* ── Greeting ── */}
      <View style={styles.greetRow}>
        <Text style={styles.greetText}>Hello, {firstName}</Text>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Featured ── */}
      {featured && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LATEST</Text>
          </View>
          <MemoryCard
            item={featured} featured
            onPress={() => openMemory(featured)}
            onLike={() => toggleLike(featured)}
          />
        </>
      )}

      {/* ── Grid label ── */}
      {gridMemories.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ALL MEMORIES</Text>
          <Text style={styles.sectionCount}>{gridMemories.length}</Text>
        </View>
      )}
    </AView>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <MemoryGrid
        memories={gridMemories}
        onOpen={openMemory}
        onLike={toggleLike}
        ListHeader={ListHeader}
      />

      {/* FAB */}
      <APressable
        style={[styles.fab, { bottom: insets.bottom + 24 }, fabStyle]}
        onPress={() => sheetRef.current?.expand()}
        onPressIn={() => { fabSc.value = withSpring(0.92, { damping: 12 }); }}
        onPressOut={() => { fabSc.value = withSpring(1, { damping: 10 }); }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </APressable>

      <UploadSheet ref={sheetRef} onUploaded={fetchMemories} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  /* nav */
  navBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', paddingHorizontal: S.lg, paddingBottom: S.sm,
  },
  navLeft: {},
  navTitle: {
    fontSize: 34, fontWeight: F.black, color: C.label,
    letterSpacing: -1.2, lineHeight: 36,
  },
  navSub: { fontSize: F.xs, fontWeight: F.medium, color: C.label4, marginTop: 1 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 4 },
  avatarBtn: {},
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.green,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: F.sm, fontWeight: F.bold },

  /* greeting */
  greetRow: { paddingHorizontal: S.lg, paddingVertical: S.sm },
  greetText: {
    fontSize: F.lg, fontWeight: F.medium, color: C.label2, letterSpacing: -0.2,
  },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: C.sep, marginHorizontal: S.lg, marginBottom: S.md },

  /* section labels */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.lg, marginBottom: S.sm,
  },
  sectionTitle: {
    fontSize: F.xs, fontWeight: F.heavy, color: C.label4,
    letterSpacing: 1.2,
  },
  sectionCount: {
    fontSize: F.xs, fontWeight: F.bold, color: C.green,
    backgroundColor: C.greenTint, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10,
  },

  /* FAB */
  fab: {
    position: 'absolute', right: S.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.green,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.lg,
  },
  fabIcon: { color: '#fff', fontSize: 28, fontWeight: F.regular, lineHeight: 32 },
});
