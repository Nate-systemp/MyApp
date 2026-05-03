import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  Alert, Keyboard, TouchableWithoutFeedback, StatusBar, Image,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import YinMascot from './YinMascot';
import { C, F, R, S, shadow } from '../constants/Yin';

const AView = Animated.createAnimatedComponent(View);

// Helper to decode base64 to ArrayBuffer (Nuclear fix for 0-byte issue)
const decodeBase64 = (base64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0;
  if (base64[base64.length - 1] === '=') { bufferLength--; if (base64[base64.length - 2] === '=') bufferLength--; }
  const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (i = 0; i < len; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)], encoded2 = lookup[base64.charCodeAt(i+1)],
          encoded3 = lookup[base64.charCodeAt(i+2)], encoded4 = lookup[base64.charCodeAt(i+3)];
    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  return arraybuffer;
};

const UploadSheet = forwardRef(({ onUploaded }, ref) => {
  const { user } = useAuth();
  const snapPoints = useMemo(() => ['80%'], []);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const progress = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, quality: 0.85, base64: true,
    });
    if (!result.canceled) { setImage(result.assets[0]); setSuccess(false); }
  };

  const upload = async () => {
    if (!image) return;
    Keyboard.dismiss();
    setUploading(true);
    progress.value = withTiming(0.3, { duration: 400 });
    try {
      const ext = image.uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${user?.id ?? 'anon'}/${fileName}`;

      // THE NUCLEAR OPTION: Convert base64 string to a Binary Array
      // This ensures the file size is NEVER 0.
      const base64 = image.base64;
      const arrayBuffer = decodeBase64(base64);
      
      progress.value = withTiming(0.6, { duration: 800 });
      const { error: upErr } = await supabase.storage
        .from('photos').upload(filePath, arrayBuffer, { 
          contentType: image.mimeType || 'image/jpeg',
          upsert: true 
        });
        
      if (upErr) {
        Alert.alert("Storage Error", upErr.message);
        throw upErr;
      }

      progress.value = withTiming(0.85, { duration: 400 });
      
      // Construct URL (Direct link)
      const publicUrl = `https://fnxufhbguwkqemxfylyf.supabase.co/storage/v1/object/public/photos/${filePath}`;
      
      const { error: dbErr } = await supabase.from('memories').insert({
        caption, photo_url: publicUrl, uploaded_by: user?.email ?? 'unknown',
      });
      if (dbErr) throw dbErr;
      progress.value = withTiming(1, { duration: 300 });
      setSuccess(true);
      setTimeout(() => {
        setImage(null); setCaption(''); setSuccess(false);
        progress.value = 0;
        ref?.current?.close();
        onUploaded?.();
      }, 2200);
    } catch (e) {
      Alert.alert('Upload failed', e.message);
      progress.value = withTiming(0, { duration: 300 });
    } finally {
      setUploading(false);
    }
  };

  const renderBackdrop = useCallback(p =>
    <BottomSheetBackdrop {...p} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.3} />, []);

  return (
    <BottomSheet
      ref={ref} index={-1} snapPoints={snapPoints} enablePanDownToClose
      backgroundStyle={styles.sheetBg} handleIndicatorStyle={styles.handle}
      backdropComponent={renderBackdrop} keyboardBehavior="interactive" keyboardBlurBehavior="restore"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <BottomSheetView style={styles.content}>
          {success ? (
            /* ── SUCCESS ── */
            <View style={styles.successWrap}>
              <YinMascot size={100} spinning />
              <Text style={styles.successTitle}>Saved!</Text>
              <Text style={styles.successBody}>Your memory has been added</Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>New Memory</Text>
                <Pressable onPress={() => ref?.current?.close()} style={styles.closeBtn}>
                  <View style={styles.closeIcon} />
                </Pressable>
              </View>

              {/* progress bar */}
              {uploading && (
                <View style={styles.progressTrack}>
                  <AView style={[styles.progressFill, progressStyle]} />
                </View>
              )}

              {/* image picker */}
              <Pressable style={[styles.imgPicker, image && styles.imgPickerFilled]} onPress={pickImage}>
                {image
                  ? <>
                      <Image source={{ uri: image.uri }} style={styles.imgPreview} contentFit="cover" />
                      <View style={styles.changeChip}>
                        <Text style={styles.changeChipText}>Change photo</Text>
                      </View>
                    </>
                  : <View style={styles.imgPlaceholder}>
                      <View style={styles.cameraCircle}>
                        <View style={styles.solidCameraBody}>
                          <View style={styles.solidCameraLens} />
                        </View>
                      </View>
                      <Text style={styles.imgPlaceholderTitle}>Add a photo</Text>
                      <Text style={styles.imgPlaceholderSub}>Tap to choose from library</Text>
                    </View>
                }
              </Pressable>

              {/* caption */}
              <View style={styles.captionBlock}>
                <Text style={styles.captionLabel}>CAPTION</Text>
                <TextInput
                  style={styles.captionInput}
                  placeholder="What made this moment special?"
                  placeholderTextColor={C.placeholder}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              {/* meta */}
              <View style={styles.metaRow}>
                <View style={[styles.dot, { backgroundColor: C.success }]} />
                <Text style={styles.metaText}>
                  Uploading as <Text style={{ color: C.green, fontWeight: F.semibold }}>{user?.email}</Text>
                </Text>
              </View>

              {/* CTA */}
              <Pressable
                style={[styles.saveBtn, (!image || uploading) && styles.saveBtnDisabled]}
                onPress={upload}
                disabled={!image || uploading}
              >
                {uploading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>{image ? 'Save Memory' : 'Pick a photo first'}</Text>
                }
              </Pressable>
            </>
          )}
        </BottomSheetView>
      </TouchableWithoutFeedback>
    </BottomSheet>
  );
});

export default UploadSheet;

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: C.bg },
  handle: { backgroundColor: C.sepStrong, width: 36 },
  content: { flex: 1, paddingHorizontal: S.lg, paddingTop: 4, paddingBottom: S.lg },

  /* header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.lg },
  headerTitle: { fontSize: F.xl, fontWeight: F.bold, color: C.label, letterSpacing: -0.5 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.bgSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: C.label3, fontWeight: F.bold },
  closeIcon: {
    width: 12,
    height: 2,
    backgroundColor: C.label3,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
  },

  /* progress */
  progressTrack: {
    height: 3, backgroundColor: C.bgTertiary, borderRadius: 2,
    marginBottom: S.md, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: C.green, borderRadius: 2 },

  /* image picker */
  imgPicker: {
    width: '100%', height: 180, borderRadius: R.xl,
    borderWidth: 1.5, borderColor: C.sep, borderStyle: 'dashed',
    overflow: 'hidden', marginBottom: S.md,
    backgroundColor: C.bgSecondary,
  },
  imgPickerFilled: { borderStyle: 'solid', borderColor: 'transparent' },
  imgPreview: { width: '100%', height: '100%' },
  imgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cameraCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.sep,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: S.sm,
  },
  imgPlaceholderTitle: { fontSize: F.md, fontWeight: F.semibold, color: C.label2 },
  imgPlaceholderSub: { fontSize: F.xs, color: C.label4, marginTop: 3 },
  solidCameraBody: {
    width: 32,
    height: 24,
    borderRadius: 4,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidCameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.bg,
  },
  changeChip: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  changeChipText: { color: '#fff', fontSize: 12, fontWeight: F.semibold },

  /* caption */
  captionBlock: {
    borderRadius: R.lg, borderWidth: 1, borderColor: C.sep,
    backgroundColor: C.bg, padding: S.md, marginBottom: S.sm,
  },
  captionLabel: {
    fontSize: 10, fontWeight: F.heavy, color: C.label4,
    letterSpacing: 1.2, marginBottom: 6,
  },
  captionInput: { fontSize: F.md, color: C.label, minHeight: 52, lineHeight: 22 },

  /* meta */
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: S.lg },
  dot: { width: 7, height: 7, borderRadius: 4 },
  metaText: { fontSize: 12, color: C.label3 },

  /* save button */
  saveBtn: {
    backgroundColor: C.green, borderRadius: R.xl,
    paddingVertical: 16, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: F.lg, fontWeight: F.bold, letterSpacing: -0.3 },

  /* success */
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 32, fontWeight: F.black, color: C.label, letterSpacing: -1, marginTop: S.md },
  successBody: { fontSize: F.md, color: C.label3, marginTop: 8 },
});
