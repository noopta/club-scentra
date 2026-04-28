import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback,
  Dimensions, Animated, ActivityIndicator, StatusBar, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { events as eventsApi, EventPost } from '@/lib/api';
import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const STORY_DURATION_MS = 5000;

type Story = {
  id: string;
  imageUrl: string;
  caption: string | null;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function StoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId: string; eventTitle?: string; eventImage?: string }>();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [eventEnded, setEventEnded] = useState(false);
  const [canAddStory, setCanAddStory] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [postsRes, eventData] = await Promise.all([
          eventsApi.getPosts(params.eventId),
          eventsApi.getById(params.eventId),
        ]);

        const now = new Date();
        const startAt = new Date(eventData.startAt);
        const endAt = eventData.endAt ? new Date(eventData.endAt) : null;
        const oneHourBeforeStart = new Date(startAt.getTime() - 60 * 60 * 1000);
        
        const isEnded = endAt ? now > endAt : false;
        const canPost = !isEnded && now >= oneHourBeforeStart;
        
        if (!cancelled) {
          setEventEnded(isEnded);
          setCanAddStory(canPost);
        }

        const mapped: Story[] = postsRes.posts.map((p: EventPost) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          caption: p.caption,
          authorName: p.author.displayName || p.author.username,
          authorAvatar: p.author.avatarUrl,
          createdAt: p.createdAt,
        }));

        // Fallback: if no posts exist yet, show the event's cover image as a single placeholder story
        if (mapped.length === 0 && params.eventImage) {
          mapped.push({
            id: 'cover',
            imageUrl: params.eventImage,
            caption: isEnded 
              ? 'This event has ended' 
              : 'Be the first to share a moment from this meet',
            authorName: params.eventTitle || 'Event',
            authorAvatar: null,
            createdAt: new Date().toISOString(),
          });
        }
        if (!cancelled) setStories(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.eventId, params.eventImage, params.eventTitle]);

  // Pause the entire story timer (animation, auto-advance, end-of-queue
  // router.back) whenever the viewer is not the active screen — e.g. while
  // the create-post screen, an image picker, or the camera is open on top.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const isNavigating = useRef(false);

  const safeGoBack = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.back();
  }, [router]);

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= stories.length) {
        setTimeout(safeGoBack, 0);
        return i;
      }
      return i + 1;
    });
  }, [stories.length, safeGoBack]);

  useEffect(() => {
    if (stories.length <= 1) return;
    const nextIndex = Math.min(index + 1, stories.length - 1);
    const nextStory = stories[nextIndex];
    if (nextStory && nextStory.imageUrl) {
      ExpoImage.prefetch(nextStory.imageUrl);
    }
    if (nextIndex + 1 < stories.length) {
      const futureStory = stories[nextIndex + 1];
      if (futureStory?.imageUrl) {
        ExpoImage.prefetch(futureStory.imageUrl);
      }
    }
  }, [index, stories]);

  useEffect(() => {
    if (loading || stories.length === 0 || paused || !isFocused) return;
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      useNativeDriver: false,
    });
    animRef.current = anim;
    anim.start(({ finished }) => { if (finished) advance(); });
    return () => { anim.stop(); };
  }, [index, loading, stories.length, paused, isFocused]);

  const handleTapLeft = useCallback(() => {
    if (index > 0) setIndex(index - 1);
  }, [index]);
  
  const handleTapRight = useCallback(() => {
    advance();
  }, [advance]);

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator color="#FFF" size="large" />
      </View>
    );
  }

  if (stories.length === 0) {
    return (
      <View style={[s.container, s.center]}>
        <StatusBar barStyle="light-content" />
        <Text style={s.emptyText}>No stories yet for this meet</Text>
        <TouchableOpacity style={s.closeBtnEmpty} onPress={safeGoBack}>
          <Text style={s.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const story = stories[index];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      <ExpoImage source={{ uri: story.imageUrl }} style={s.bgImage} contentFit="cover" transition={200} />
      <View style={s.dim} />

      <View style={s.topBar}>
        <View style={s.progressRow}>
          {stories.map((_, i) => (
            <View key={i} style={s.progressTrack}>
              <Animated.View
                style={[
                  s.progressFill,
                  {
                    width: i < index
                      ? '100%'
                      : i === index
                        ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={s.headerRow}>
          <View style={s.avatarWrap}>
            {story.authorAvatar ? (
              <Image source={{ uri: story.authorAvatar }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarFallback]}>
                <Text style={s.avatarLetter}>{story.authorName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.authorName} numberOfLines={1}>{story.authorName}</Text>
            <Text style={s.timeText}>{timeAgo(story.createdAt)}{params.eventTitle ? ` · ${params.eventTitle}` : ''}</Text>
          </View>
          {canAddStory && (
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => router.push({
                pathname: '/create-post',
                params: {
                  eventId: params.eventId,
                  eventTitle: params.eventTitle,
                  eventImage: params.eventImage,
                },
              })}
              hitSlop={10}
            >
              <Ionicons name="add-circle-outline" size={28} color="#FFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.closeBtn} onPress={safeGoBack} hitSlop={10}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[s.tapZones, { pointerEvents: 'box-none' }]}>
        <TouchableWithoutFeedback
          onPress={handleTapLeft}
          onPressIn={() => setPaused(true)}
          onPressOut={() => setPaused(false)}
        >
          <View style={s.tapZoneLeft} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={handleTapRight}
          onPressIn={() => setPaused(true)}
          onPressOut={() => setPaused(false)}
        >
          <View style={s.tapZoneRight} />
        </TouchableWithoutFeedback>
      </View>

      {story.caption ? (
        <View style={[s.captionWrap, { pointerEvents: 'none' }]}>
          <Text style={s.captionText}>{story.caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  bgImage: { ...StyleSheet.absoluteFillObject, width: SCREEN_W, height: SCREEN_H },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  topBar: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 0, right: 0, paddingHorizontal: 12, zIndex: 10 },
  progressRow: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  progressTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFF' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#FFF', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: { backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  authorName: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  timeText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 },
  addBtn: { padding: 4, marginRight: 4 },
  closeBtn: { padding: 4 },
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  tapZoneLeft: { flex: 1 },
  tapZoneRight: { flex: 2 },
  captionWrap: { position: 'absolute', bottom: 60, left: 20, right: 20 },
  captionText: { color: '#FFF', fontSize: 16, fontWeight: '500', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  emptyText: { color: '#FFF', fontSize: 16, marginBottom: 20 },
  closeBtnEmpty: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#FFF' },
  closeBtnText: { color: '#FFF', fontWeight: '600' },
});
