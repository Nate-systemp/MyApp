import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { C, F, S, R } from '../constants/Yin';

export default function ProfileModal({ visible, onClose }) {
  const { user, signOut } = useAuth();
  
  const firstName = user?.email?.split('@')[0] ?? 'User';
  const email = user?.email ?? '';

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modal}>
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
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    backgroundColor: C.bg,
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    paddingHorizontal: S.xl,
    paddingTop: S.xxl,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    paddingBottom: S.xxl,
    gap: S.md,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLargeText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: F.black,
  },
  name: {
    fontSize: F.xxl,
    fontWeight: F.black,
    color: C.label,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: F.md,
    color: C.label3,
  },
  actions: {
    gap: S.md,
  },
  actionBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: S.lg,
    paddingHorizontal: S.xl,
    borderRadius: R.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    color: '#fff',
    fontSize: F.lg,
    fontWeight: F.bold,
    letterSpacing: -0.3,
  },
  cancelBtn: {
    backgroundColor: C.fill,
    paddingVertical: S.lg,
    paddingHorizontal: S.xl,
    borderRadius: R.lg,
    alignItems: 'center',
  },
  cancelText: {
    color: C.label,
    fontSize: F.lg,
    fontWeight: F.semibold,
    letterSpacing: -0.3,
  },
});