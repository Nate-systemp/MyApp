import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse, G, Rect, Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring, Easing,
} from 'react-native-reanimated';

const AView = Animated.createAnimatedComponent(View);

/**
 * YinMascot — a solid Siamese cat character.
 * Siamese colours: cream body (#F5EDD8), dark seal-brown points (#3D2314), blue eyes (#4A90D9)
 *
 * Props:
 *  size     – component size (default 100)
 *  spinning – trigger a celebratory spin
 */
export default function YinMascot({ size = 100, spinning = false }) {
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const sc = useSharedValue(1);

  // Gentle float loop
  useEffect(() => {
    ty.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(7, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true,
    );
  }, []);

  // Happy spin on upload success
  useEffect(() => {
    if (spinning) {
      rot.value = 0;
      rot.value = withSpring(360, { damping: 8, stiffness: 80 });
      sc.value = withSequence(
        withSpring(1.2, { damping: 6 }),
        withSpring(1, { damping: 8 }),
      );
    }
  }, [spinning]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
      { scale: sc.value },
    ],
  }));

  // Scale the SVG viewBox: everything is drawn in 200x220 units
  const vbSize = 200;

  return (
    <AView style={[{ width: size, height: size * 1.1 }, aStyle]}>
      <Svg width={size} height={size * 1.1} viewBox={`0 0 ${vbSize} 220`}>

        {/* ── TAIL (behind body) ── */}
        <Path
          d="M155 195 Q190 160 175 130 Q165 115 158 130 Q168 155 148 185 Z"
          fill="#3D2314"
        />

        {/* ── BODY — cream oval ── */}
        <Ellipse cx="100" cy="155" rx="55" ry="60" fill="#F5EDD8" />

        {/* ── BODY BELLY — slightly lighter center ── */}
        <Ellipse cx="100" cy="162" rx="30" ry="38" fill="#FAF3E8" />

        {/* ── YIN-YANG MARK on belly (small, solid) ── */}
        <Circle cx="100" cy="168" r="10" fill="none" stroke="#E0D0B8" strokeWidth="1.5" />
        <Path d="M100 158 A5 5 0 0 1 100 168 A10 10 0 0 1 100 158Z" fill="#E0D0B8" />
        <Circle cx="100" cy="161" r="2" fill="#FAF3E8" />
        <Circle cx="100" cy="175" r="2" fill="#E0D0B8" />

        {/* ── FRONT PAWS ── */}
        <Ellipse cx="72" cy="210" rx="18" ry="10" fill="#3D2314" />
        <Ellipse cx="128" cy="210" rx="18" ry="10" fill="#3D2314" />
        {/* paw toe lines */}
        <Path d="M64 207 Q68 212 72 207" fill="none" stroke="#2A160C" strokeWidth="1" strokeLinecap="round" />
        <Path d="M72 207 Q76 212 80 207" fill="none" stroke="#2A160C" strokeWidth="1" strokeLinecap="round" />
        <Path d="M120 207 Q124 212 128 207" fill="none" stroke="#2A160C" strokeWidth="1" strokeLinecap="round" />
        <Path d="M128 207 Q132 212 136 207" fill="none" stroke="#2A160C" strokeWidth="1" strokeLinecap="round" />

        {/* ── HEAD — cream circle ── */}
        <Circle cx="100" cy="90" r="52" fill="#F5EDD8" />

        {/* ── FACE MASK — dark brown center face (Siamese) ── */}
        <Ellipse cx="100" cy="100" rx="28" ry="24" fill="#3D2314" />

        {/* ── EARS — triangles, dark brown ── */}
        <Polygon points="58,52 44,20 78,42" fill="#3D2314" />
        <Polygon points="142,52 156,20 122,42" fill="#3D2314" />
        {/* inner ear — pink */}
        <Polygon points="60,50 51,30 74,44" fill="#C4776A" />
        <Polygon points="140,50 149,30 126,44" fill="#C4776A" />

        {/* ── EYES — Siamese blue ── */}
        {/* left eye */}
        <Ellipse cx="82" cy="87" rx="12" ry="10" fill="#4A90D9" />
        <Ellipse cx="82" cy="87" rx="7" ry="9" fill="#1A1A2E" />
        <Circle cx="86" cy="83" r="3" fill="#FFFFFF" />
        <Circle cx="79" cy="90" r="1.5" fill="#FFFFFF" opacity="0.6" />
        {/* right eye */}
        <Ellipse cx="118" cy="87" rx="12" ry="10" fill="#4A90D9" />
        <Ellipse cx="118" cy="87" rx="7" ry="9" fill="#1A1A2E" />
        <Circle cx="122" cy="83" r="3" fill="#FFFFFF" />
        <Circle cx="115" cy="90" r="1.5" fill="#FFFFFF" opacity="0.6" />

        {/* ── NOSE — small triangle, dark ── */}
        <Path d="M97 104 L103 104 L100 108 Z" fill="#C4776A" />

        {/* ── MOUTH ── */}
        <Path d="M100 108 Q95 114 91 112" fill="none" stroke="#C4776A" strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M100 108 Q105 114 109 112" fill="none" stroke="#C4776A" strokeWidth="1.5" strokeLinecap="round" />

        {/* ── WHISKERS — left ── */}
        <Path d="M90 107 L62 102" stroke="#C8B89A" strokeWidth="1" strokeLinecap="round" />
        <Path d="M90 109 L62 112" stroke="#C8B89A" strokeWidth="1" strokeLinecap="round" />
        {/* right */}
        <Path d="M110 107 L138 102" stroke="#C8B89A" strokeWidth="1" strokeLinecap="round" />
        <Path d="M110 109 L138 112" stroke="#C8B89A" strokeWidth="1" strokeLinecap="round" />

      </Svg>
    </AView>
  );
}
