import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTablas } from '@/tablas-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TablasScreen() {
  const router = useRouter();
  const { tablas, borrarTabla } = useTablas();
  const [desplegado, setDesplegado] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Botón nueva tabla */}
        <TouchableOpacity
          style={styles.botonNueva}
          onPress={() => router.push('/gestionar-tabla?nueva=' + Date.now())}>
          <ThemedText style={styles.botonTexto}>+ Nueva tabla</ThemedText>
        </TouchableOpacity>

        {/* Desplegable Tus tablas */}
        <TouchableOpacity
          style={styles.desplegableHeader}
          onPress={() => setDesplegado(!desplegado)}>
          <ThemedText type="title">{desplegado ? '▼' : '▶'} Tus tablas</ThemedText>
        </TouchableOpacity>

        {desplegado && (
          <ThemedView>
            {tablas.length === 0 ? (
              <ThemedText style={styles.vacio}>No tienes tablas todavía</ThemedText>
            ) : (
              tablas.map(tabla => (
                <ThemedView key={tabla.id} style={styles.tablaCard}>
                  <ThemedView style={styles.tablaHeader}>
                    <ThemedText style={styles.tablaNombre}>{tabla.nombre}</ThemedText>
                    <ThemedView style={styles.tablaAcciones}>
                      <TouchableOpacity onPress={() => router.push(`/gestionar-tabla?id=${tabla.id}`)}>
                        <ThemedText style={styles.botonEntrenar}>✏️</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => router.push(`/entrenar?id=${tabla.id}&t=${Date.now()}`)}>
                        <ThemedText style={styles.botonEntrenar}>▶️</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        if (window.confirm(`¿Seguro que quieres borrar "${tabla.nombre}"?`)) {
                          borrarTabla(tabla.id);
                        }
                      }}>
                        <ThemedText style={styles.botonBorrar}>🗑️</ThemedText>
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>
                  {tabla.ejercicios.map(ej => (
                    <ThemedText key={ej.id} style={styles.ejercicioLinea}>
                      • {ej.nombre} — {ej.series}x{ej.repeticiones} {ej.temporizador ? 'seg' : 'reps'}
                      {ej.peso ? ` — ${ej.peso}kg` : ''}
                    </ThemedText>
                  ))}
                </ThemedView>
              ))
            )}
          </ThemedView>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  botonNueva: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  botonTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  desplegableHeader: {
    marginBottom: 12,
  },
  tablaCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    gap: 4,
  },
  tablaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ejercicioLinea: {
    fontSize: 14,
    paddingLeft: 8,
    opacity: 0.8,
  },
  vacio: {
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 16,
  },
  tablaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  botonBorrar: {
    fontSize: 18,
    padding: 4,
  },
  tablaAcciones: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  botonEntrenar: {
    fontSize: 18,
    padding: 4,
  },
});