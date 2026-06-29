import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ejercicio, useTablas } from '@/tablas-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIPOS_EJERCICIO = [
  { id: 'calistenia', icono: '🤸', label: 'Calistenia' },
  { id: 'yoga', icono: '🧘', label: 'Yoga' },
  { id: 'pesas', icono: '🏋️', label: 'Pesas' },
  { id: 'cardio', icono: '⏱️', label: 'Cardio' },
];

const EJERCICIO_VACIO = {
  nombre: '', descripcion: '', tipo: '', series: '',
  repeticiones: '', descanso: '', peso: '', temporizador: false, imagen: '',
};

export default function EditarTablaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tablas, editarTabla } = useTablas();

  const tabla = tablas.find(t => t.id === Number(id));

  const [nombreTabla, setNombreTabla] = useState(tabla?.nombre || '');
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>(tabla?.ejercicios || []);
  const [mostrarFormEjercicio, setMostrarFormEjercicio] = useState(false);
  const [ejercicioEditando, setEjercicioEditando] = useState<number | null>(null);
  const [formEjercicio, setFormEjercicio] = useState({ ...EJERCICIO_VACIO });

  function abrirFormNuevo() {
    setFormEjercicio({ ...EJERCICIO_VACIO });
    setEjercicioEditando(null);
    setMostrarFormEjercicio(true);
  }

  function abrirFormEditar(ej: Ejercicio) {
    setFormEjercicio({ ...ej, imagen: ej.imagen || '' });
    setEjercicioEditando(ej.id);
    setMostrarFormEjercicio(true);
  }

  function guardarEjercicio() {
    if (!formEjercicio.nombre || !formEjercicio.tipo) return;
    if (ejercicioEditando !== null) {
      setEjercicios(prev => prev.map(e =>
        e.id === ejercicioEditando ? { ...formEjercicio, id: ejercicioEditando } : e
      ));
    } else {
      setEjercicios(prev => [...prev, { ...formEjercicio, id: Date.now() }]);
    }
    setMostrarFormEjercicio(false);
    setEjercicioEditando(null);
    setFormEjercicio({ ...EJERCICIO_VACIO });
  }

  function borrarEjercicio(id: number) {
    if (window.confirm('¿Borrar este ejercicio?')) {
      setEjercicios(prev => prev.filter(e => e.id !== id));
    }
  }

  function guardarTabla() {
    if (!nombreTabla || ejercicios.length === 0) return;
    editarTabla(Number(id), { nombre: nombreTabla, ejercicios });
    router.back();
  }

  if (!tabla) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>Tabla no encontrada</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Cabecera */}
        <ThemedView style={styles.cabecera}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.botonVolver}>← Volver</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Editar tabla</ThemedText>
        </ThemedView>

        {/* Nombre */}
        <ThemedText type="subtitle">Nombre de la tabla</ThemedText>
        <TextInput
          style={styles.input}
          value={nombreTabla}
          onChangeText={setNombreTabla}
        />

        {/* Lista de ejercicios */}
        <ThemedText type="subtitle">Ejercicios</ThemedText>
        {ejercicios.map(ej => (
          <ThemedView key={ej.id} style={styles.ejercicioCard}>
            <ThemedView style={styles.ejercicioHeader}>
              <ThemedText style={styles.ejercicioNombre}>
                {TIPOS_EJERCICIO.find(t => t.id === ej.tipo)?.icono} {ej.nombre}
              </ThemedText>
              <ThemedView style={styles.ejercicioAcciones}>
                <TouchableOpacity onPress={() => abrirFormEditar(ej)}>
                  <ThemedText style={styles.botonIcono}>✏️</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => borrarEjercicio(ej.id)}>
                  <ThemedText style={styles.botonIcono}>🗑️</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            <ThemedText style={styles.detalle}>
              {ej.series} series x {ej.repeticiones} {ej.temporizador ? 'seg' : 'reps'} — descanso {ej.descanso}s
            </ThemedText>
            {ej.peso ? <ThemedText style={styles.detalle}>🏋️ {ej.peso} kg</ThemedText> : null}
            {ej.descripcion ? <ThemedText style={styles.detalle}>📝 {ej.descripcion}</ThemedText> : null}
          </ThemedView>
        ))}

        {/* Formulario ejercicio */}
        {mostrarFormEjercicio ? (
          <ThemedView style={styles.formEjercicio}>
            <ThemedText type="subtitle">Nombre del ejercicio</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Ej: Press banca"
              value={formEjercicio.nombre}
              onChangeText={v => setFormEjercicio({ ...formEjercicio, nombre: v })}
            />

            <ThemedText type="subtitle">Descripción</ThemedText>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Ej: Bajar la barra hasta el pecho..."
              multiline
              numberOfLines={3}
              value={formEjercicio.descripcion}
              onChangeText={v => setFormEjercicio({ ...formEjercicio, descripcion: v })}
            />

            <ThemedText type="subtitle">Tipo</ThemedText>
            <ThemedView style={styles.tiposContainer}>
              {TIPOS_EJERCICIO.map(tipo => (
                <TouchableOpacity
                  key={tipo.id}
                  style={[styles.tipoBoton, formEjercicio.tipo === tipo.id && styles.tipoSeleccionado]}
                  onPress={() => setFormEjercicio({ ...formEjercicio, tipo: tipo.id })}>
                  <ThemedText>{tipo.icono} {tipo.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>

            <TouchableOpacity
              style={[styles.tipoBoton, formEjercicio.temporizador && styles.tipoSeleccionado]}
              onPress={() => setFormEjercicio({ ...formEjercicio, temporizador: !formEjercicio.temporizador })}>
              <ThemedText>⏱️ Activar temporizador</ThemedText>
            </TouchableOpacity>

            <ThemedView style={styles.seriesContainer}>
              <ThemedView style={styles.seriescampo}>
                <ThemedText type="subtitle">Series</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  keyboardType="numeric"
                  value={formEjercicio.series}
                  onChangeText={v => setFormEjercicio({ ...formEjercicio, series: v })}
                />
              </ThemedView>
              <ThemedText style={styles.por}>x</ThemedText>
              <ThemedView style={styles.seriescampo}>
                <ThemedText type="subtitle">{formEjercicio.temporizador ? 'Tiempo (seg)' : 'Reps'}</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder={formEjercicio.temporizador ? '45' : '10'}
                  keyboardType="numeric"
                  value={formEjercicio.repeticiones}
                  onChangeText={v => setFormEjercicio({ ...formEjercicio, repeticiones: v })}
                />
              </ThemedView>
              <ThemedText style={styles.por}>x</ThemedText>
              <ThemedView style={styles.seriescampo}>
                <ThemedText type="subtitle">Descanso (seg)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="60"
                  keyboardType="numeric"
                  value={formEjercicio.descanso}
                  onChangeText={v => setFormEjercicio({ ...formEjercicio, descanso: v })}
                />
              </ThemedView>
            </ThemedView>

            <ThemedText type="subtitle">Peso (kg)</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Ej: 60"
              keyboardType="numeric"
              value={formEjercicio.peso}
              onChangeText={v => setFormEjercicio({ ...formEjercicio, peso: v })}
            />

            <TouchableOpacity style={styles.botonGuardar} onPress={guardarEjercicio}>
              <ThemedText style={styles.botonTexto}>
                {ejercicioEditando !== null ? '✅ Guardar cambios' : '✅ Añadir ejercicio'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonCancelar} onPress={() => setMostrarFormEjercicio(false)}>
              <ThemedText style={styles.botonCancelarTexto}>Cancelar</ThemedText>
            </TouchableOpacity>

          </ThemedView>
        ) : (
          <TouchableOpacity style={styles.botonAñadir} onPress={abrirFormNuevo}>
            <ThemedText style={styles.botonTexto}>+ Añadir ejercicio</ThemedText>
          </TouchableOpacity>
        )}

        {/* Guardar tabla */}
        <TouchableOpacity style={styles.botonGuardar} onPress={guardarTabla}>
          <ThemedText style={styles.botonTexto}>Guardar tabla</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  cabecera: { marginBottom: 24, gap: 8 },
  botonVolver: { fontSize: 16, color: '#208AEF' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 12, fontSize: 16, marginTop: 8, marginBottom: 16,
  },
  inputMultilinea: { height: 80, textAlignVertical: 'top' },
  ejercicioCard: { padding: 12, borderRadius: 10, marginBottom: 8, gap: 4 },
  ejercicioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ejercicioNombre: { fontSize: 16, fontWeight: 'bold' },
  ejercicioAcciones: { flexDirection: 'row', gap: 8 },
  botonIcono: { fontSize: 18, padding: 4 },
  detalle: { fontSize: 13, opacity: 0.7, paddingLeft: 8 },
  formEjercicio: { padding: 16, borderRadius: 10, marginBottom: 16 },
  tiposContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tipoBoton: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 16 },
  tipoSeleccionado: { borderColor: '#208AEF', backgroundColor: '#E6F4FE' },
  seriesContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  seriescampo: { flex: 1 },
  por: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  botonAñadir: {
    borderWidth: 2, borderColor: '#208AEF', borderStyle: 'dashed',
    borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 16,
  },
  botonGuardar: {
    backgroundColor: '#208AEF', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  botonCancelar: {
    borderWidth: 1, borderColor: '#ccc', padding: 16,
    borderRadius: 10, alignItems: 'center', marginBottom: 16,
  },
  botonCancelarTexto: { fontSize: 16, opacity: 0.6 },
  botonTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});