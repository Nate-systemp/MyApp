import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  Keyboard, TouchableWithoutFeedback, StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing,
} from 'react-native-reanimated';
import YinMascot from '../../components/YinMascot';
import { useAuth } from '../../contexts/AuthContext';
import { C, F, R, S, shadow } from '../../constants/Yin';

const AView = Animated.createAnimatedComponent(View);

/* ── Single input row ────────────────────────────────────────── */
function InputRow({ label, value, onChangeText, secureTextEntry, keyboardType, returnKeyType, onSubmitEditing, inputRef }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={styles.inputField}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={C.placeholder}
      />
    </View>
  );
}

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const passRef = useRef(null);

  /* staggered slide-up */
  const op = [0,1,2,3].map(() => useSharedValue(0));
  const ty = [0,1,2,3].map(() => useSharedValue(24));

  useEffect(() => {
    op.forEach((v, i) => {
      v.value = withDelay(i * 100 + 80, withTiming(1, { duration: 500 }));
    });
    ty.forEach((v, i) => {
      v.value = withDelay(i * 100 + 80, withSpring(0, { damping: 20, stiffness: 200 }));
    });
  }, []);

  const aStyle = (i) => useAnimatedStyle(() => ({
    opacity: op[i].value,
    transform: [{ translateY: ty[i].value }],
  }));

  const handleAuth = async () => {
    Keyboard.dismiss();
    if (!email || !password) { Alert.alert('Required', 'Enter your email and password.'); return; }
    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>

          {/* ── Top: mascot + wordmark ── */}
          <AView style={[styles.hero, aStyle(0)]}>
            <YinMascot size={90} />
            <View style={styles.wordmark}>
              <Text style={styles.appName}>Yin</Text>
              <Text style={styles.appTagline}>Your moments, together</Text>
            </View>
          </AView>

          {/* ── Form card ── */}
          <AView style={[styles.formCard, aStyle(1)]}>
            <Text style={styles.formHeading}>
              {isSignUp ? 'Create account' : 'Sign in'}
            </Text>

            {/* grouped input block */}
            <View style={styles.inputGroup}>
              <InputRow
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
              />
              <View style={styles.inputDivider} />
              <InputRow
                inputRef={passRef}
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={handleAuth}
              />
            </View>
          </AView>

          {/* ── Primary button ── */}
          <AView style={[aStyle(2)]}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed, loading && styles.primaryBtnLoading]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
              }
            </Pressable>
          </AView>

          {/* ── Toggle ── */}
          <AView style={[styles.toggleWrap, aStyle(3)]}>
            <Pressable onPress={() => setIsSignUp(v => !v)}>
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account?  ' : "Don't have an account?  "}
                <Text style={styles.toggleLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
              </Text>
            </Pressable>
          </AView>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  kav: { flex: 1, justifyContent: 'center', paddingHorizontal: S.lg },

  /* hero */
  hero: { alignItems: 'center', marginBottom: S.xl },
  wordmark: { alignItems: 'center', marginTop: S.md },
  appName: {
    fontSize: 42,
    fontWeight: F.black,
    color: C.label,
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  appTagline: {
    fontSize: F.sm,
    fontWeight: F.medium,
    color: C.label4,
    letterSpacing: 0.2,
    marginTop: 4,
  },

  /* form card */
  formCard: {
    backgroundColor: C.bg,
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.sep,
    marginBottom: S.md,
    ...shadow.md,
  },
  formHeading: {
    fontSize: F.xl,
    fontWeight: F.bold,
    color: C.label,
    letterSpacing: -0.5,
    paddingHorizontal: S.md,
    paddingTop: S.md,
    paddingBottom: S.sm,
  },
  inputGroup: { overflow: 'hidden', borderRadius: R.lg },

  /* input row — iOS grouped style */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.md,
    paddingVertical: 13,
    backgroundColor: C.bg,
  },
  inputRowFocused: { backgroundColor: '#FAFAFA' },
  inputLabel: {
    fontSize: F.md,
    fontWeight: F.medium,
    color: C.label,
    width: 90,
  },
  inputField: {
    flex: 1,
    fontSize: F.md,
    color: C.label,
    fontWeight: F.regular,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.sep,
    marginLeft: S.md + 90, /* align with text start */
  },

  /* button */
  primaryBtn: {
    backgroundColor: C.green,
    borderRadius: R.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: S.sm,
    ...shadow.md,
  },
  primaryBtnPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  primaryBtnLoading: { opacity: 0.7 },
  primaryBtnText: {
    color: '#fff',
    fontSize: F.lg,
    fontWeight: F.bold,
    letterSpacing: -0.3,
  },

  /* toggle */
  toggleWrap: { alignItems: 'center' },
  toggleText: { fontSize: F.sm, color: C.label3 },
  toggleLink: { color: C.green, fontWeight: F.semibold },
});
