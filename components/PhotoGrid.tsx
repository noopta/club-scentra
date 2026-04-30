import React, { useState, useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Modal, Text, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { social, Comment, Post } from '@/lib/api';

const screenWidth = Dimensions.get('window').width;
const photoSize = (screenWidth - Theme.spacing.md * 2 - Theme.spacing.sm) / 2;

interface PhotoGridProps {
  photos: string[];
  posts?: Post[];
}

export default function PhotoGrid({ photos, posts }: PhotoGridProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;
  const selectedPost = posts && selectedIndex !== null ? posts[selectedIndex] : null;

  const openPhoto = async (index: number) => {
    setSelectedIndex(index);
    setComments([]);
    if (posts && posts[index]) {
      setLoadingComments(true);
      try {
        const res = await social.getComments(posts[index].id);
        setComments(res.comments);
      } catch {
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const closePhoto = () => {
    setSelectedIndex(null);
    setComments([]);
    setNewComment('');
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || submitting) return;
    setSubmitting(true);
    try {
      const comment = await social.addComment(selectedPost.id, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (photos.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyText}>No photos yet</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.grid}>
        {photos.map((photo, index) => (
          <TouchableOpacity key={index} onPress={() => openPhoto(index)} activeOpacity={0.9}>
            <Image source={{ uri: photo }} style={styles.photo} />
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={selectedIndex !== null} transparent animationType="fade" onRequestClose={closePhoto}>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePhoto} />
          
          <View style={styles.expandedContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closePhoto}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>

            {selectedPhoto && (
              <Image source={{ uri: selectedPhoto }} style={styles.expandedPhoto} resizeMode="contain" />
            )}

            {selectedPost && (
              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comments</Text>
                
                {loadingComments ? (
                  <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
                ) : comments.length === 0 ? (
                  <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                ) : (
                  <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
                    {comments.map((c) => (
                      <View key={c.id} style={styles.commentRow}>
                        <Text style={styles.commentAuthor}>@{c.author.username}</Text>
                        <Text style={styles.commentBody}>{c.body}</Text>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, (!newComment.trim() || submitting) && styles.sendButtonDisabled]}
                    onPress={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Ionicons name="send" size={18} color="#FFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    color: c.textSecondary,
    marginTop: Theme.spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  expandedContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedPhoto: {
    width: screenWidth,
    height: screenWidth,
  },
  commentsSection: {
    backgroundColor: c.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Theme.spacing.md,
    maxHeight: 280,
  },
  commentsTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: c.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  noComments: {
    fontSize: Theme.fontSize.sm,
    color: c.textSecondary,
    textAlign: 'center',
    paddingVertical: Theme.spacing.md,
  },
  commentsList: {
    maxHeight: 140,
  },
  commentRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  commentAuthor: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: c.textPrimary,
  },
  commentBody: {
    fontSize: Theme.fontSize.sm,
    color: c.textSecondary,
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: c.inputBackground,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: Theme.fontSize.sm,
    color: c.textPrimary,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: c.border,
  },
});
