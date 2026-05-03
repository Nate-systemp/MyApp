import React, { forwardRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useAuth } from '../contexts/AuthContext';
import { C, F, S, R } from '../constants/Yin';

const ProfileSheet = forwardRef((props, ref) => {
  const { user, signOut } = useAuth();
  const snapPoints = useMemo(() => ['40%'], []);
  
  const firstName = user?.email?.split('@')[0] ?? 'User';
  const email = user?.email ?? '';

  const handleSignOut = async () => {
    try {
      await signOut();
      ref.current?.close();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={handleSignOut}>
            <Text style={styles.actionText}>Sign Out</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

ProfileSheet.displayName = 'ProfileSheet';

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: C.bg,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
  },
  indicator: {
    backgroundColor: C.label4,
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: S.lg,
    paddingTop: S.md,
  },
  header: {
    alignItems: 'center',
    paddingBottom: S.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.md,
  },
  avatarLargeText: {
    color: '#fff',
    fontSize: F.xxl,
    fontWeight: F.bold,
  },
  name: {
    fontSize: F.xl,
    fontWeight: F.bold,
    color: C.label,
    marginBottom: S.xs,
  },
  email: {
    fontSize: F.md,
    color: C.label3,
  },
  actions: {
    gap: S.sm,
  },
  actionBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
    borderRadius: R.md,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: F.md,
    fontWeight: F.semibold,
  },
});

export default ProfileSheet;