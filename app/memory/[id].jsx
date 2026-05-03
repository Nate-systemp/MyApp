import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, Alert, StatusBar, Image, TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../supabase';
import { C, F, S, shadow } from '../../constants/Yin';

const { width: W } = Dimensions.get('window');

export default function MemoryDetail() {
  const { id, item: itemStr } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [captionDraft, setCaptionDraft] = useState('');
  const viewRef = useRef();

  const item = useMemo(() => {
    try {
      return JSON.parse(itemStr);
    } catch {
      return { id, photo_url: '', caption: '', created_at: '' };
    }
  }, [id, itemStr]);
  const [currentItem, setCurrentItem] = useState(item);

  useEffect(() => {
    setCurrentItem(item);
    setCaptionDraft(item.caption ?? '');
  }, [item]);

  const persistUpdate = async (changes) => {
    if (!currentItem?.id) return;
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('memories')
        .update(changes)
        .eq('id', currentItem.id)
        .select('*')
        .single();
      if (error) throw error;
      setCurrentItem((prev) => ({ ...prev, ...data, ...changes }));
    } catch (e) {
      Alert.alert('Update failed', e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Memory', 'Remove this memory for both of you?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            const pathParts = currentItem.photo_url.split('/public/photos/');
            const filePath = pathParts[1]?.split('?')[0];
            if (filePath) {
              await supabase.storage.from('photos').remove([filePath]);
            }
            const { error } = await supabase.from('memories').delete().eq('id', currentItem.id);
            if (error) throw error;
            router.back();
          } catch (e) {
            Alert.alert("Delete failed", e.message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const downloadPolaroid = async () => {
    try {
      setSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your gallery to save the photo.');
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved!', 'The Polaroid has been saved to your gallery.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save the image.');
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  const dateStr = currentItem.created_at
    ? new Date(currentItem.created_at).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* ── POLAROID FRAME ── */}
      <View style={styles.polaroidContainer}>
        <View 
          ref={viewRef}
          collapsable={false}
          style={styles.polaroidFrame}
        >
          {/* The Image Area */}
          <View style={styles.imageArea}>
            <Image
              source={{ uri: currentItem.photo_url }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* The Footer (Caption & Date) */}
          <View style={styles.polaroidFooter}>
            {editing ? (
              <TextInput
                value={captionDraft}
                onChangeText={setCaptionDraft}
                style={styles.captionInput}
                placeholder="Write a caption"
                placeholderTextColor={C.label4}
                multiline
                autoFocus
              />
            ) : (
              <Text style={styles.polaroidCaption}>
                {currentItem.caption || 'No caption'}
              </Text>
            )}
            <Text style={styles.polaroidDate}>{dateStr}</Text>
          </View>
        </View>
      </View>

      {/* ── TOP NAV BAR ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]} onPress={() => router.back()}>
          <View style={styles.backCircle}>
             <Text style={styles.backIcon}>‹</Text>
          </View>
        </Pressable>
        
        <View style={styles.topRight}>
          <Pressable 
            style={[styles.saveBtn, saving && { opacity: 0.5 }]} 
            onPress={downloadPolaroid}
            disabled={saving}
          >
            <View style={styles.saveIcon}>
               <View style={styles.saveArrow} />
               <View style={styles.saveBar} />
            </View>
          </Pressable>

          <Pressable
            style={[styles.likeBtn, currentItem.liked && styles.likeBtnActive]}
            disabled={updating}
            onPress={async () => {
              Haptics.selectionAsync();
              await persistUpdate({ liked: !currentItem.liked });
            }}
          >
            <Text style={[styles.likeBtnText, currentItem.liked && styles.likeBtnTextActive]}>
              {currentItem.liked ? 'Liked' : 'Like'}
            </Text>
          </Pressable>

          {editing ? (
            <Pressable
              style={[styles.editBtn, updating && { opacity: 0.5 }]}
              disabled={updating}
              onPress={async () => {
                await persistUpdate({ caption: captionDraft.trim() });
                setEditing(false);
              }}
            >
              <Text style={styles.editBtnText}>Save</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.editBtn}
              onPress={() => {
                setCaptionDraft(currentItem.caption ?? '');
                setEditing(true);
              }}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
          )}

          <Pressable style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgSecondary },

  polaroidContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.lg,
  },
  polaroidFrame: {
    width: W - 40,
    backgroundColor: '#FFFFFF',
    padding: 12,
    paddingBottom: 40,
    borderRadius: 4,
    ...shadow.lg,
    elevation: 10,
  },
  imageArea: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  polaroidFooter: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  polaroidCaption: {
    fontSize: F.lg,
    fontWeight: F.bold,
    color: C.label,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  polaroidDate: {
    fontSize: F.xs,
    color: C.label4,
    marginTop: 8,
    fontWeight: F.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  captionInput: {
    width: '100%',
    textAlign: 'center',
    color: C.label,
    fontSize: F.lg,
    fontWeight: F.semibold,
    minHeight: 32,
    paddingHorizontal: 8,
  },

  /* nav */
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: S.md,
  },
  backCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: C.label, lineHeight: 28, marginRight: 2 },
  navBtnPressed: { opacity: 0.7 },
  
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saveBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  saveIcon: {
    width: 14, height: 14,
    alignItems: 'center', justifyContent: 'flex-end',
  },
  saveArrow: {
    width: 8, height: 8,
    borderLeftWidth: 2, borderBottomWidth: 2,
    borderColor: C.green,
    transform: [{ rotate: '-45deg' }],
    marginBottom: 2,
  },
  saveBar: {
    width: 12, height: 2,
    backgroundColor: C.green,
  },

  deleteBtn: {
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  deleteBtnText: { color: C.error, fontSize: F.sm, fontWeight: F.bold },
  likeBtn: {
    backgroundColor: C.bg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  likeBtnActive: {
    backgroundColor: C.greenTint,
  },
  likeBtnText: {
    color: C.label2,
    fontSize: F.sm,
    fontWeight: F.semibold,
  },
  likeBtnTextActive: {
    color: C.greenDark,
  },
  editBtn: {
    backgroundColor: 'rgba(11,110,79,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editBtnText: {
    color: C.green,
    fontSize: F.sm,
    fontWeight: F.bold,
  },
});
