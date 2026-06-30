import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFotos } from '@/fotos-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type Modo = 'inicio' | 'camara' | 'confirmar' | 'galeria';

export default function FotosScreen() {
  const { fotos, añadirFoto, borrarFoto } = useFotos();
  const [modo, setModo] = useState<Modo>('inicio');
  const [fotoUri, setFotoUri] = useState('');
  const [peso, setPeso] = useState('');
  const [fotoActual, setFotoActual] = useState(0);

  const [permisoCamera, requestPermisoCamera] = useCameraPermissions();
  const [permisoMedia, requestPermisoMedia] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);

  async function abrirCamara() {
    if (!permisoCamera?.granted) {
      const result = await requestPermisoCamera();
      if (!result.granted) return;
    }
    setModo('camara');
  }

  async function hacerFoto() {
    if (!cameraRef.current) return;
    const foto = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    setFotoUri(foto.uri);
    setModo('confirmar');
  }

  async function guardarFoto() {
    if (!permisoMedia?.granted) {
      await requestPermisoMedia();
    }
    const fecha = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    añadirFoto({ uri: fotoUri, fecha, peso: peso || undefined });
    setPeso('');
    setFotoUri('');
    setModo('inicio');
  }

  if (modo === 'camara') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front" />
        <View style={styles.cameraControles}>
          <TouchableOpacity style={styles.botonCancelarCamera} onPress={() => setModo('inicio')}>
            <ThemedText style={styles.botonTextoBlanco}>✕ Cancelar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonCaptura} onPress={hacerFoto}>
            <View style={styles.botonCapturaInner} />
          </TouchableOpacity>
          <View style={{ width: 80 }} />
        </View>
      </View>
    );
  }

  if (modo === 'confirmar') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.confirmarContainer}>
          <ThemedText type="title" style={styles.titulo}>¿Guardar foto?</ThemedText>
          <Image source={{ uri: fotoUri }} style={styles.preview} />
          <ThemedText type="subtitle">Peso (opcional)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ej: 75.5 kg"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />
          <TouchableOpacity style={styles.botonGuardar} onPress={guardarFoto}>
            <ThemedText style={styles.botonTexto}>✅ Guardar foto</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonRepetir} onPress={() => setModo('camara')}>
            <ThemedText style={styles.botonRepetirTexto}>📷 Repetir foto</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonCancelarTexto2} onPress={() => setModo('inicio')}>
            <ThemedText style={styles.botonCancelarTexto3}>Cancelar</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (modo === 'galeria') {
    const fotosOrdenadas = [...fotos].reverse();
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.galeriaHeader}>
          <TouchableOpacity onPress={() => setModo('inicio')}>
            <ThemedText style={styles.botonVolver}>← Volver</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Galería</ThemedText>
        </ThemedView>

        {fotosOrdenadas.length === 0 ? (
          <ThemedText style={styles.vacio}>No hay fotos todavía</ThemedText>
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setFotoActual(index);
            }}>
            {fotosOrdenadas.map((foto) => (
              <View key={foto.id} style={styles.fotoSlide}>
                <Image source={{ uri: foto.uri }} style={styles.fotoGaleria} />
                <ThemedView style={styles.fotoInfo}>
                  <ThemedText style={styles.fotoFecha}>📅 {foto.fecha}</ThemedText>
                  {foto.peso ? (
                    <ThemedText style={styles.fotoPeso}>⚖️ {foto.peso} kg</ThemedText>
                  ) : null}
                  <TouchableOpacity onPress={() => {
                    if (window.confirm('¿Borrar esta foto?')) {
                      borrarFoto(foto.id);
                    }
                  }}>
                    <ThemedText style={styles.botonBorrar}>🗑️ Borrar</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </View>
            ))}
          </ScrollView>
        )}

        {fotosOrdenadas.length > 0 && (
          <ThemedView style={styles.indicadores}>
            {fotosOrdenadas.map((_, i) => (
              <View key={i} style={[styles.punto, i === fotoActual && styles.puntoActivo]} />
            ))}
          </ThemedView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title" style={styles.titulo}>Foto diaria</ThemedText>
      <TouchableOpacity style={styles.botonPrincipal} onPress={abrirCamara}>
        <ThemedText style={styles.botonEmoji}>📷</ThemedText>
        <ThemedText style={styles.botonTexto}>Nueva foto</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.botonSecundario} onPress={() => setModo('galeria')}>
        <ThemedText style={styles.botonEmoji}>🖼️</ThemedText>
        <ThemedText style={styles.botonTextoSecundario}>
          Ver galería ({fotos.length} fotos)
        </ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { marginBottom: 24 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraControles: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 32,
  },
  botonCaptura: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
  },
  botonCapturaInner: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'white', borderWidth: 2, borderColor: '#ccc',
  },
  botonCancelarCamera: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 8 },
  botonTextoBlanco: { color: 'white', fontSize: 14 },
  confirmarContainer: { padding: 16, gap: 12 },
  preview: { width: '100%', height: 400, borderRadius: 16, resizeMode: 'cover', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 12, fontSize: 16, marginTop: 8, marginBottom: 8,
  },
  botonGuardar: { backgroundColor: '#208AEF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  botonRepetir: { borderWidth: 2, borderColor: '#208AEF', padding: 14, borderRadius: 12, alignItems: 'center' },
  botonRepetirTexto: { color: '#208AEF', fontSize: 16, fontWeight: 'bold' },
  botonCancelarTexto2: { alignItems: 'center', padding: 12 },
  botonCancelarTexto3: { opacity: 0.5, fontSize: 16 },
  botonTexto: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  botonTextoSecundario: { fontSize: 18, fontWeight: 'bold' },
  botonPrincipal: { backgroundColor: '#208AEF', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 16, gap: 8 },
  botonSecundario: { borderWidth: 2, borderColor: '#208AEF', padding: 24, borderRadius: 16, alignItems: 'center', gap: 8 },
  botonEmoji: { fontSize: 40 },
  galeriaHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  botonVolver: { fontSize: 16, color: '#208AEF' },
  vacio: { opacity: 0.5, textAlign: 'center', marginTop: 32 },
  fotoSlide: { width, alignItems: 'center' },
  fotoGaleria: { width: width, height: width * 1.4, resizeMode: 'cover' },
  fotoInfo: { padding: 16, gap: 8, width: '100%', alignItems: 'center' },
  fotoFecha: { fontSize: 16, fontWeight: 'bold' },
  fotoPeso: { fontSize: 16 },
  botonBorrar: { color: '#ef4444', marginTop: 8 },
  indicadores: { flexDirection: 'row', justifyContent: 'center', gap: 6, padding: 12 },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc' },
  puntoActivo: { backgroundColor: '#208AEF' },
});