import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTablas } from '@/tablas-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIPOS_EJERCICIO = [
  { id: 'calistenia', icono: '🤸', label: 'Calistenia' },
  { id: 'yoga', icono: '🧘', label: 'Yoga' },
  { id: 'pesas', icono: '🏋️', label: 'Pesas' },
  { id: 'cardio', icono: '⏱️', label: 'Cardio' },
];

export default function NuevaTablaScreen() {
  const router = useRouter();
  const { añadirTabla } = useTablas();
  const [nombreTabla, setNombreTabla] = useState('');
  const [ejercicios, setEjercicios] = useState([]);
  const [mostrarFormEjercicio, setMostrarFormEjercicio] = useState(false);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    series: '',
    repeticiones: '',
    descanso: '',
    peso: '',
    temporizador: false,
  });

function guardarTabla() {
  if (!nombreTabla || ejercicios.length === 0) return;
  añadirTabla({ nombre: nombreTabla, ejercicios });
  router.back();
}

  function añadirEjercicio() {
    if (!nuevoEjercicio.nombre || !nuevoEjercicio.tipo) return;
    setEjercicios([...ejercicios, { ...nuevoEjercicio, id: Date.now() }]);
    setNuevoEjercicio({ nombre: '', descripcion: '', tipo: '', series: '', repeticiones: '', temporizador: false });
    setMostrarFormEjercicio(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Cabecera */}
        <ThemedView style={styles.cabecera}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.botonVolver}>← Volver</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Nueva tabla</ThemedText>
        </ThemedView>

        {/* Nombre de la tabla */}
        <ThemedText type="subtitle">Nombre de la tabla</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ej: Día de pecho"
          value={nombreTabla}
          onChangeText={setNombreTabla}
        />

        {/* Lista de ejercicios añadidos */}
        <ThemedText type="subtitle">Ejercicios</ThemedText>
        {ejercicios.map(ej => (
          <ThemedView key={ej.id} style={styles.ejercicioCard}>
            <ThemedText style={styles.ejercicioNombre}>
              {TIPOS_EJERCICIO.find(t => t.id === ej.tipo)?.icono} {ej.nombre}
            </ThemedText>
            {ej.descripcion ? (
              <ThemedText style={styles.detalle}>📝 {ej.descripcion}</ThemedText>
            ) : null}
            <ThemedText style={styles.detalle}>
              {ej.series} series x {ej.repeticiones} {ej.temporizador ? 'seg' : 'reps'}
            </ThemedText>
            {ej.temporizador ? (
              <ThemedText style={styles.detalle}>⏱️ Con temporizador</ThemedText>
            ) : null}
          </ThemedView>
        ))}

        {/* Formulario nuevo ejercicio */}
        {mostrarFormEjercicio ? (
          <ThemedView style={styles.formEjercicio}>

            <ThemedText type="subtitle">Nombre del ejercicio</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Ej: Press banca"
              value={nuevoEjercicio.nombre}
              onChangeText={v => setNuevoEjercicio({ ...nuevoEjercicio, nombre: v })}
            />

            <ThemedText type="subtitle">Descripción</ThemedText>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Ej: Bajar la barra hasta el pecho, codos a 45 grados..."
              multiline
              numberOfLines={3}
              value={nuevoEjercicio.descripcion}
              onChangeText={v => setNuevoEjercicio({ ...nuevoEjercicio, descripcion: v })}
            />

            <ThemedText type="subtitle">Tipo</ThemedText>
            <ThemedView style={styles.tiposContainer}>
              {TIPOS_EJERCICIO.map(tipo => (
                <TouchableOpacity
                  key={tipo.id}
                  style={[
                    styles.tipoBoton,
                    nuevoEjercicio.tipo === tipo.id && styles.tipoSeleccionado,
                  ]}
                  onPress={() => setNuevoEjercicio({ ...nuevoEjercicio, tipo: tipo.id })}>
                  <ThemedText>{tipo.icono} {tipo.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>

            {/* Temporizador toggle */}
            <TouchableOpacity
              style={[styles.tipoBoton, nuevoEjercicio.temporizador && styles.tipoSeleccionado]}
              onPress={() => setNuevoEjercicio({ ...nuevoEjercicio, temporizador: !nuevoEjercicio.temporizador })}>
              <ThemedText>⏱️ Activar temporizador</ThemedText>
            </TouchableOpacity>

            {/* Peso */}
            <ThemedText type="subtitle">Peso (kg)</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Ej: 60"
              keyboardType="numeric"
              value={nuevoEjercicio.peso}
              onChangeText={v => setNuevoEjercicio({ ...nuevoEjercicio, peso: v })}
            />


          {/* Series x Repeticiones/Tiempo x Descanso */}
            <ThemedView style={styles.seriesContainer}>
              <ThemedView style={styles.seriescampo}>
                <ThemedText type="subtitle">Series</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  keyboardType="numeric"
                  value={nuevoEjercicio.series}
                  onChangeText={v => setNuevoEjercicio({ ...nuevoEjercicio, series: v })}
                />
              </ThemedView>

              <ThemedText style={styles.por}>x</ThemedText>

              <ThemedView style={styles.seriescampo}>
                <ThemedText type="subtitle">
                  {nuevoEjercicio.temporizador ? 'Tiempo (seg)' : 'Reps'}
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder={nuevoEjercicio.temporizador ? '45' : '10'}
                  keyboardType="numeric"
                  value={nuevoEjercicio.repeticiones}
                  onChangeText={v => setNuevoEjercicio({ ...nuevoEjercicio, repeticiones: v })}
                />
              </ThemedView>

              <ThemedText style={styles.por}>x</ThemedText>

              <ThemedView style={styles.seriescampo}>
                <ThemedText type="subtitle">Descanso (seg)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="60"
                  keyboardType="numeric"
                  value={nuevoEjercicio.descanso}
                  onChangeText={v => setNuevoEjercicio({ ...nuevoEjercicio, descanso: v })}
                />
              </ThemedView>
            </ThemedView>

            <TouchableOpacity style={styles.botonGuardar} onPress={añadirEjercicio}>
              <ThemedText style={styles.botonTexto}>✅ Añadir ejercicio</ThemedText>
            </TouchableOpacity>

          </ThemedView>
        ) : (
          <TouchableOpacity
            style={styles.botonAñadir}
            onPress={() => setMostrarFormEjercicio(true)}>
            <ThemedText style={styles.botonTexto}>+ Añadir ejercicio</ThemedText>
          </TouchableOpacity>
        )}

        {/* Botón guardar tabla */}
        {ejercicios.length > 0 && (
          <TouchableOpacity style={styles.botonGuardar} onPress={guardarTabla}>
            <ThemedText style={styles.botonTexto}>Guardar tabla</ThemedText>
          </TouchableOpacity>
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
  cabecera: {
    marginBottom: 24,
    gap: 8,
  },
  botonVolver: {
    fontSize: 16,
    color: '#208AEF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  inputMultilinea: {
    height: 80,
    textAlignVertical: 'top',
  },
  ejercicioCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 4,
  },
  ejercicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detalle: {
    fontSize: 13,
    opacity: 0.7,
    paddingLeft: 8,
  },
  formEjercicio: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  tiposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tipoBoton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  tipoSeleccionado: {
    borderColor: '#208AEF',
    backgroundColor: '#E6F4FE',
  },
  seriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  seriescamp: {
    flex: 1,
  },
  seriescamp: {
    flex: 1,
  },
  por: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  botonAñadir: {
    borderWidth: 2,
    borderColor: '#208AEF',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonGuardar: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  botonTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});