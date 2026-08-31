import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEjercicios } from '@/ejercicios-context';
import { useHistorial } from '@/historial-context';
import { useTablas } from '@/tablas-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIPOS_EJERCICIO = [
  { id: 'calistenia', icono: '🤸' },
  { id: 'yoga', icono: '🧘' },
  { id: 'pesas', icono: '🏋️' },
  { id: 'cardio', icono: '⏱️' },
];

export default function EntrenarScreen() {
  const router = useRouter();
  const { id, t } = useLocalSearchParams();
  const { tablas, avanzarRotativo } = useTablas();
  const { ejercicios: biblioteca } = useEjercicios();
  const { guardarSesion } = useHistorial();

  const tabla = tablas.find(t => t.id === Number(id));

  const ejerciciosResueltos = tabla?.ejercicios.map(ej => {
    if (!ej.rotativo) return ej;
    const grupo = ej.grupoMuscular || '';
    const candidatos = biblioteca.filter(e => e.grupoMuscular === grupo);
    if (candidatos.length === 0) return ej;
    const indice = tabla.contadoresRotativos?.[grupo] ?? 0;
    const candidato = candidatos[indice % candidatos.length];
    return {
      ...ej,
      nombre: candidato.nombre,
      descripcion: candidato.descripcion,
      tipo: candidato.tipo,
      imagen: candidato.imagen,
      series: candidato.series,
      repeticiones: candidato.repeticiones,
      descanso: candidato.descanso,
      peso: candidato.peso,
      temporizador: candidato.temporizador,
      _eraRotativo: true,
    };
  }) || [];

  const [ejercicioIndex, setEjercicioIndex] = useState(0);
  const [serieActual, setSerieActual] = useState(1);
  const [fase, setFase] = useState<'ejercicio' | 'descanso' | 'fin'>('ejercicio');
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [sessionKey, setSessionKey] = useState(t);

  // Estrellas por ejercicio
  const [estrellasEjercicios, setEstrellasEjercicios] = useState<number[]>(
    () => ejerciciosResueltos.map(() => 5)
  );

  const inicioSesion = useRef(Date.now());

  useEffect(() => {
    if (sessionKey !== t) {
      setSessionKey(t);
      setEjercicioIndex(0);
      setSerieActual(1);
      setFase('ejercicio');
      setSegundos(0);
      setCorriendo(false);
      setEstrellasEjercicios(ejerciciosResueltos.map(() => 5));
      inicioSesion.current = Date.now();
    }
  }, [t]);

  const ejercicio = ejerciciosResueltos[ejercicioIndex];

  useEffect(() => {
    if (!corriendo) return;
    if (segundos <= 0) {
      setCorriendo(false);
      if (fase === 'ejercicio') iniciarDescanso();
      if (fase === 'descanso') terminarDescanso();
      return;
    }
    const intervalo = setInterval(() => setSegundos(s => s - 1), 1000);
    return () => clearInterval(intervalo);
  }, [corriendo, segundos]);

  function perderEstrella() {
    setEstrellasEjercicios(prev => prev.map((e, i) =>
      i === ejercicioIndex ? Math.max(0, e - 1) : e
    ));
  }

  function iniciarDescanso() {
    setFase('descanso');
    setSegundos(Number(ejercicio?.descanso) || 60);
    setCorriendo(true);
  }

  function terminarDescanso() {
    const totalSeries = Number(ejercicio?.series) || 1;
    if (serieActual < totalSeries) {
      setSerieActual(s => s + 1);
      setFase('ejercicio');
      setSegundos(0);
      setCorriendo(false);
    } else {
      siguienteEjercicio();
    }
  }

  function siguienteEjercicio() {
    if (!tabla) return;
    const ejOriginal = tabla.ejercicios[ejercicioIndex];
    if (ejOriginal?.rotativo && ejOriginal.grupoMuscular) {
      const candidatos = biblioteca.filter(e => e.grupoMuscular === ejOriginal.grupoMuscular);
      avanzarRotativo(tabla.id, ejOriginal.grupoMuscular, candidatos.length);
    }
    if (ejercicioIndex + 1 < ejerciciosResueltos.length) {
      setEjercicioIndex(i => i + 1);
      setSerieActual(1);
      setFase('ejercicio');
      setSegundos(0);
      setCorriendo(false);
    } else {
      terminarEntrenamiento();
    }
  }

  function terminarEntrenamiento() {
    if (!tabla) return;
    const duracion = Math.round((Date.now() - inicioSesion.current) / 60000);
    const ejerciciosHistorial = ejerciciosResueltos.map((ej, i) => ({
      nombre: ej.nombre,
      tipo: ej.tipo || '',
      series: Number(ej.series) || 0,
      repeticiones: ej.repeticiones || '',
      peso: ej.peso || '',
      estrellas: estrellasEjercicios[i] ?? 5,
    }));
    const estrellaMedia = ejerciciosHistorial.reduce((acc, e) => acc + e.estrellas, 0) / ejerciciosHistorial.length;
    const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    guardarSesion({
      tablaId: tabla.id,
      tablaNombre: tabla.nombre,
      fecha,
      duracionMinutos: duracion,
      ejercicios: ejerciciosHistorial,
      estrellaMedia: Math.round(estrellaMedia * 10) / 10,
    });
    setFase('fin');
  }

  function pulsarVerde() {
    if (!ejercicio) return;
    if (ejercicio.temporizador) {
      if (corriendo) {
        setCorriendo(false);
        iniciarDescanso();
      } else {
        setSegundos(Number(ejercicio.repeticiones) || 30);
        setCorriendo(true);
      }
    } else {
      iniciarDescanso();
    }
  }

  function pulsarRojo() {
    if (!ejercicio) return;
    perderEstrella();
    if (ejercicio.temporizador && corriendo) {
      setCorriendo(false);
    }else{
      perderEstrella();
    }
    iniciarDescanso();
  }

  function saltarEjercicio() {
    setEstrellasEjercicios(prev => prev.map((e, i) =>
      i === ejercicioIndex ? 0 : e
    ));
    if (corriendo) setCorriendo(false);
    siguienteEjercicio();
  }

  if (!tabla) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>Tabla no encontrada</ThemedText>
      </SafeAreaView>
    );
  }

  if (fase === 'fin') {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centrado}>
          <ThemedText style={styles.emoji}>🎉</ThemedText>
          <ThemedText type="title">¡Entrenamiento completado!</ThemedText>
          <TouchableOpacity style={styles.botonPrincipal} onPress={() => router.back()}>
            <ThemedText style={styles.botonTexto}>Volver a tablas</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (fase === 'descanso') {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centrado}>
          <ThemedText style={styles.emoji}>⏳</ThemedText>
          <ThemedText type="title">Descansando...</ThemedText>
          <ThemedText style={styles.timer}>{segundos}s</ThemedText>
          <TouchableOpacity style={styles.botonSecundario} onPress={() => {
            setCorriendo(false);
            terminarDescanso();
          }}>
            <ThemedText style={styles.botonTextoSecundario}>Saltar descanso</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <ThemedView style={styles.cabecera}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.botonVolver}>← Volver</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.progreso}>
            Ejercicio {ejercicioIndex + 1} de {ejerciciosResueltos.length}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.ejercicioCard}>
          <ThemedText style={styles.emoji}>
            {TIPOS_EJERCICIO.find(t => t.id === ejercicio?.tipo)?.icono ?? '💪'}
          </ThemedText>
          <ThemedText type="title">{ejercicio?.nombre}</ThemedText>
          {ejercicio?.descripcion ? (
            <ThemedText style={styles.descripcion}>{ejercicio.descripcion}</ThemedText>
          ) : null}
          <ThemedText style={styles.serieInfo}>
            Serie {serieActual} de {ejercicio?.series}
          </ThemedText>
          <ThemedText style={styles.serieInfo}>
            {ejercicio?.temporizador
              ? `⏱️ ${ejercicio.repeticiones} segundos`
              : `${ejercicio?.repeticiones} repeticiones`}
          </ThemedText>
          {ejercicio?.peso ? (
            <ThemedText style={styles.serieInfo}>🏋️ {ejercicio.peso} kg</ThemedText>
          ) : null}
        </ThemedView>

        {ejercicio?.temporizador && corriendo && (
          <ThemedText style={styles.timer}>{segundos}s</ThemedText>
        )}

        {/* Botones Verde y Rojo */}
        <ThemedView style={styles.botonesContainer}>
          <TouchableOpacity style={styles.botonRojo} onPress={pulsarRojo}>
            <ThemedText style={styles.botonEmoji}>👎</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonVerde} onPress={pulsarVerde}>
            <ThemedText style={styles.botonEmoji}>
              {ejercicio?.temporizador
                ? corriendo ? '⏹️' : '▶️'
                : '👍'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity style={styles.botonSaltar} onPress={saltarEjercicio}>
          <ThemedText style={styles.botonSaltarTexto}>⏭️ Saltar ejercicio</ThemedText>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'stretch', justifyContent: 'space-between', backgroundColor: '#ffffff'},
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 },
  cabecera: { top: 1 ,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  botonVolver: { fontSize: 16, color: '#208AEF' },
  progreso: { opacity: 0.6 },
  ejercicioCard: { padding: 24, borderRadius: 16, alignItems: 'center', gap: 8 },
  emoji: { fontSize: 48 },
  descripcion: { opacity: 0.7, textAlign: 'center', marginTop: 4 },
  serieInfo: { fontSize: 18, fontWeight: 'bold' },
  timer: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#208AEF' },
  botonesContainer: { flexDirection: 'row', gap: 16, marginTop: 8 },
  botonVerde: {
    flex: 1, backgroundColor: '#22c55e', padding: 20,
    borderRadius: 16, alignItems: 'center',
  },
  botonRojo: {
    flex: 1, backgroundColor: '#ef4444', padding: 20,
    borderRadius: 16, alignItems: 'center',
  },
  botonEmoji: { fontSize: 32 },
  botonPrincipal: {
    backgroundColor: '#208AEF', padding: 20, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  botonSecundario: {
    borderWidth: 2, borderColor: '#208AEF', padding: 16,
    borderRadius: 16, alignItems: 'center',
  },
  botonTexto: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  botonTextoSecundario: { fontSize: 16, color: '#208AEF', fontWeight: 'bold' },
  botonSaltar: {
    borderWidth: 1, borderColor: '#ccc', padding: 12,
    borderRadius: 12, alignItems: 'center' , marginTop: 4,
  },
  botonSaltarTexto: { fontSize: 14, opacity: 0.6 },
});