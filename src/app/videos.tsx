// app/(tabs)/gallery.tsx (o el path correspondiente en tu proyecto)
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

// Lista de tus videos: pon aquí los IDs de YouTube
const VIDEOS = [
  { id: 'dQw4w9WgXcQ', title: 'Video 1' },
  { id: 'jNQXAC9IVRw', title: 'Video 2' },
  { id: '9bZkp7q19f0', title: 'Video 3' },
  { id: 'kJQP7kiw5Fk', title: 'Video 4' },
  { id: 'OPf0YbXqDm0', title: 'Video 5' },
  { id: 'fJ9rUzIMcZQ', title: 'Video 6' },
];

function getThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function GalleryScreen() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const renderItem = ({ item }: { item: typeof VIDEOS[0] }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.8}
      onPress={() => setSelectedVideo(item.id)}
    >
      <Image source={{ uri: getThumbnail(item.id) }} style={styles.thumbnail} />
      <View style={styles.playOverlay}>
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={VIDEOS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />

      <Modal
        visible={!!selectedVideo}
        animationType="slide"
        onRequestClose={() => setSelectedVideo(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedVideo(null)}
          >
            <Text style={styles.closeText}>✕ Cerrar</Text>
          </TouchableOpacity>
          {selectedVideo && (
            <WebView
              style={styles.webview}
              javaScriptEnabled
              allowsFullscreenVideo
              source={{
                uri: `https://www.youtube.com/embed/${selectedVideo}?autoplay=1&playsinline=1`,
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  grid: { padding: ITEM_MARGIN },
  row: { justifyContent: 'flex-start' },
  item: {
    width: ITEM_WIDTH,
    marginBottom: ITEM_MARGIN,
    marginRight: ITEM_MARGIN,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_WIDTH * (9 / 16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { color: '#fff', fontSize: 16, marginLeft: 2 },
  title: { marginTop: 4, fontSize: 13, fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: '#000' },
  closeButton: { padding: 12, alignItems: 'flex-end' },
  closeText: { color: '#fff', fontSize: 16 },
  webview: { flex: 1 },
});