import { View, Text, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import { C, F, R, S, shadow } from '../constants/Yin';

const { width: W } = Dimensions.get('window');
const GRID_GAP = 12;
const CARD_W = (W - S.lg * 2 - GRID_GAP) / 2;
const CARD_IMG_H = CARD_W * 1.2;

const APressable = Animated.createAnimatedComponent(Pressable);

/* ── Solid heart icon (no emoji) ─────────────────────────────── */
function HeartButton({ liked, onPress }) {
  const sc = useSharedValue(1);
  const tap = () => {
    sc.value = withSequence(withSpring(1.4, { damping: 5 }), withSpring(1, { damping: 8 }));
    onPress?.();
  };
  const s = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  return (
    <Animated.View style={s}>
      <Pressable onPress={tap} hitSlop={10} style={[styles.heartBtn, liked && styles.heartBtnActive]}>
        <View style={[styles.heartShape, liked && styles.heartShapeActive]}>
          <View style={[styles.heartPart, styles.heartLeft, liked && styles.heartPartActive]} />
          <View style={[styles.heartPart, styles.heartRight, liked && styles.heartPartActive]} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MemoryCard({ item, onPress, onLike, featured = false }) {
  const sc = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));

  const dateStr = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  /* ── FEATURED hero card ─────────────────────────────────── */
  if (featured) {
    return (
      <APressable
        style={[styles.featured, aStyle]}
        onPress={onPress}
        onPressIn={() => { sc.value = withSpring(0.98, { damping: 20 }); }}
        onPressOut={() => { sc.value = withSpring(1, { damping: 15 }); }}
      >
        {/* image */}
        <View style={styles.featuredImgWrap}>
          {item.photo_url ? (
            <Image
              source={{ uri: item.photo_url }}
              style={styles.featuredImg}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imgPlaceholder} />
          )}
        </View>
        {/* info strip below image */}
        <View style={styles.featuredStrip}>
          <View style={styles.featuredStripLeft}>
            <Text style={styles.featuredCaption} numberOfLines={1}>
              {item.caption || 'Latest memory'}
            </Text>
            <Text style={styles.featuredDate}>{dateStr}</Text>
          </View>
          <HeartButton liked={item.liked} onPress={onLike} />
        </View>
      </APressable>
    );
  }

  /* ── GRID card ───────────────────────────────────────────── */
  return (
    <APressable
      style={[styles.card, aStyle]}
      onPress={onPress}
      onPressIn={() => { sc.value = withSpring(0.96, { damping: 20 }); }}
      onPressOut={() => { sc.value = withSpring(1, { damping: 15 }); }}
    >
      {/* image */}
      <View style={styles.cardImgWrap}>
        {item.photo_url ? (
          <Image
            source={{ uri: item.photo_url }}
            style={styles.cardImg}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imgPlaceholder} />
        )}
      </View>
      {/* info strip */}
      <View style={styles.cardInfo}>
        {!!item.caption && (
          <Text style={styles.cardCaption} numberOfLines={2}>{item.caption}</Text>
        )}
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{dateStr}</Text>
          <HeartButton liked={item.liked} onPress={onLike} />
        </View>
      </View>
    </APressable>
  );
}

/* ── Heart icon via pure View (no emoji, no gradient) ── */
const HEART = 14;
const heartStyle = {
  width: HEART,
  height: HEART,
  backgroundColor: C.label4,
  transform: [{ rotate: '-45deg' }],
  borderTopLeftRadius: HEART / 2,
  borderTopRightRadius: HEART / 2,
  borderBottomRightRadius: HEART / 2,
};

const styles = StyleSheet.create({
  /* ── featured ── */
  featured: {
    marginHorizontal: S.lg,
    marginBottom: S.lg,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: C.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.sep,
    ...shadow.md,
  },
  featuredImgWrap: {
    width: '100%',
    height: 240,
    backgroundColor: '#EBEBEB',
    overflow: 'hidden',
  },
  featuredImg: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  featuredStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.md,
    paddingVertical: 12,
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.sep,
  },
  featuredStripLeft: { flex: 1, marginRight: 12 },
  featuredCaption: {
    fontSize: F.md,
    fontWeight: F.semibold,
    color: C.label,
    letterSpacing: -0.2,
  },
  featuredDate: {
    fontSize: F.xs,
    color: C.label4,
    marginTop: 3,
    fontWeight: F.medium,
  },

  /* ── grid card ── */
  card: {
    width: CARD_W,
    borderRadius: R.lg,
    overflow: 'hidden',
    backgroundColor: C.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.sep,
    ...shadow.sm,
  },
  cardImgWrap: {
    width: CARD_W,
    height: CARD_IMG_H,
    backgroundColor: '#EBEBEB',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  cardInfo: {
    padding: 10,
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.sep,
  },
  cardCaption: {
    fontSize: F.xs,
    fontWeight: F.medium,
    color: C.label2,
    marginBottom: 6,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 10,
    color: C.label4,
    fontWeight: F.medium,
  },

  /* ── heart button ── */
  heartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnActive: {
    backgroundColor: C.greenTint,
  },
  heartShape: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartShapeActive: {},
  heartPart: {
    width: 8,
    height: 12,
    backgroundColor: C.label4,
    borderRadius: 4,
    position: 'absolute',
  },
  heartPartActive: {
    backgroundColor: C.green,
  },
  heartLeft: {
    transform: [{ rotate: '-45deg' }, { translateX: -2 }],
  },
  heartRight: {
    transform: [{ rotate: '45deg' }, { translateX: 2 }],
  },
});
