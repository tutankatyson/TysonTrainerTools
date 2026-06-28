import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHistorial } from '@/historial-context';

function Estrellas({ valor }: { valor: number }) {
  return (
    <ThemedText>
      {[1, 2, 3, 4, 5].map(i => i <= Math.round(valor) ? '⭐' : '☆').join('')}
      {' '}{valor.toFixed(1)}
    </ThemedText>
  );
}

export default function HistorialScreen() {
  const { sesiones } = useHistorial();
  const sesionesOrdenadas = [...sesiones].reverse();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ThemedText type="title" style={styles.titulo}>Historial</ThemedText>

        {sesionesOrdenadas.length === 0 ? (
          <ThemedText style={styles.vacio}>
            No hay sesiones todavía. ¡Empieza a entrenar!
          </ThemedText>
        ) : (
          sesionesOrdenadas.map(sesion => (
            <ThemedView key={sesion.id} style={styles.sesionCard}>

              {/* Cabecera sesión */}
              <ThemedView style={styles.sesionHeader}>
                <ThemedText style={styles.sesionNombre}>{sesion.tablaNombre}</ThemedText>
                <ThemedText style={styles.sesionFecha}>{sesion.fecha}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.sesionMeta}>
                <ThemedText style={styles.detalle}>⏱️ {sesion.duracionMinutos} min</ThemedText>
                <Estrellas valor={sesion.estrellaMedia} />
              </ThemedView>

              {/* Ejercicios */}
              {sesion.ejercicios.map((ej, i) => (
                <ThemedView key={i} style={styles.ejercicioRow}>
                  <ThemedView style={styles.ejercicioInfo}>
                    <ThemedText style={styles.ejercicioNombre}>{ej.nombre}</ThemedText>
                    <ThemedText style={styles.detalle}>
                      {ej.series} series x {ej.repeticiones}
                      {ej.peso ? ` — ${ej.peso}kg` : ''}
                    </ThemedText>
                  </ThemedView>
                  <Estrellas valor={ej.estrellas} />
                </ThemedView>
              ))}

            </ThemedView>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { marginBottom: 16 },
  vacio: { opacity: 0.5, textAlign: 'center', marginTop: 32 },
  sesionCard: { borderRadius: 12, padding: 16, marginBottom: 12, gap: 8 },
  sesionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sesionNombre: { fontSize: 16, fontWeight: 'bold' },
  sesionFecha: { fontSize: 13, opacity: 0.6 },
  sesionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ejercicioRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 4,
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)',
  },
  ejercicioInfo: { flex: 1, gap: 2 },
  ejercicioNombre: { fontSize: 14, fontWeight: 'bold' },
  detalle: { fontSize: 12, opacity: 0.6 },
});