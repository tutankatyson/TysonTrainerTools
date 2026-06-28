import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTablas } from '@/tablas-context';
import { useEjercicios } from '@/ejercicios-context';

const TIPOS_EJERCICIO = [
  { id: 'calistenia', icono: '🤸', label: 'Calistenia' },
  { id: 'yoga', icono: '🧘', label: 'Yoga' },
  { id: 'pesas', icono: '🏋️', label: 'Pesas' },
  { id: 'cardio', icono: '⏱️', label: 'Cardio' },
];

const EJERCICIO_VACIO = {
  nombre: '', descripcion: '', tipo: '', series: '',
  repeticiones: '', descanso: '', peso: '', temporizador: false, imagen: '',
  grupoMuscular: '', rotativo: false, ejercicioBibliotecaId: null,
};

type Paso = 'lista' | 'elegirGrupo' | 'elegirEjercicio' | 'editarEjercicio';

export default function GestionarTablaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tablas, añadirTabla, editarTabla } = useTablas();
  const { ejercicios: biblioteca, grupos } = useEjercicios();

  const tablaExistente = id ? tablas.find(t => t.id === Number(id)) : null;
  const modoEdicion = !!tablaExistente;

  const [nombreTabla, setNombreTabla] = useState(tablaExistente?.nombre || '');
  const [ejercicios, setEjercicios] = useState(tablaExistente?.ejercicios || []);
  const [paso, setPaso] = useState<Paso>('lista');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [ejercicioEditando, setEjercicioEditando] = useState(null);
  const [formEjercicio, setFormEjercicio] = useState({ ...EJERCICIO_VACIO });

  function seleccionarGrupo(nombreGrupo: string) {
    setGrupoSeleccionado(nombreGrupo);
    setPaso('elegirEjercicio');
  }

  function seleccionarEjercicioBiblioteca(ej: any) {
    setFormEjercicio({
      nombre: ej.nombre,
      descripcion: ej.descripcion,
      tipo: ej.tipo,
      series: ej.series,
      repeticiones: ej.repeticiones,
      descanso: ej.descanso,
      peso: ej.peso,
      temporizador: ej.temporizador,
      imagen: ej.imagen || '',
      grupoMuscular: ej.grupoMuscular,
      rotativo: false,
      ejercicioBibliotecaId: ej.id,
    });
    setEjercicioEditando(null);
    setPaso('editarEjercicio');
  }

function seleccionarRotativo() {
    setEjercicios(prev => [...prev, {
      ...EJERCICIO_VACIO,
      id: Date.now(),
      nombre: `Rotativo — ${grupoSeleccionado}`,
      grupoMuscular: grupoSeleccionado,
      rotativo: true,
    }]);
    setPaso('lista');
  }

  function abrirFormEditar(ej: any) {
    setFormEjercicio({ ...ej, imagen: ej.imagen || '' });
    setEjercicioEditando(ej.id);
    setPaso('editarEjercicio');
  }

  function guardarEjercicio() {
    if (!formEjercicio.nombre) return;
    if (ejercicioEditando !== null) {
      setEjercicios(prev => prev.map(e =>
        e.id === ejercicioEditando ? { ...formEjercicio, id: ejercicioEditando } : e
      ));
    } else {
      setEjercicios(prev => [...prev, { ...formEjercicio, id: Date.now() }]);
    }
    setPaso('lista');
    setEjercicioEditando(null);
    setFormEjercicio({ ...EJERCICIO_VACIO });
  }

  function borrarEjercicio(ejId: number) {
    if (window.confirm('¿Borrar este ejercicio?')) {
      setEjercicios(prev => prev.filter(e => e.id !== ejId));
    }
  }

  function guardarTabla() {
    if (!nombreTabla || ejercicios.length === 0) return;
    if (modoEdicion) {
      editarTabla(Number(id), { nombre: nombreTabla, ejercicios });
    } else {
      añadirTabla({ nombre: nombreTabla, ejercicios });
    }
    router.back();
  }

  // PASO: elegir grupo muscular
  if (paso === 'elegirGrupo') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <ThemedView style={styles.cabecera}>
            <TouchableOpacity onPress={() => setPaso('lista')}>
              <ThemedText style={styles.botonVolver}>← Volver</ThemedText>
            </TouchableOpacity>
            <ThemedText type="title">Elige grupo muscular</ThemedText>
          </ThemedView>

          {grupos.length === 0 ? (
            <ThemedText style={styles.vacio}>
              No hay grupos musculares. Añádelos en la pestaña Ejercicios.
            </ThemedText>
          ) : (
            grupos.map(grupo => (
              <TouchableOpacity
                key={grupo.id}
                style={styles.opcionCard}
                onPress={() => seleccionarGrupo(grupo.nombre)}>
                <ThemedText style={styles.opcionTexto}>💪 {grupo.nombre}</ThemedText>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PASO: elegir ejercicio del grupo
  if (paso === 'elegirEjercicio') {
    const ejerciciosGrupo = biblioteca.filter(e => e.grupoMuscular === grupoSeleccionado);
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <ThemedView style={styles.cabecera}>
            <TouchableOpacity onPress={() => setPaso('elegirGrupo')}>
              <ThemedText style={styles.botonVolver}>← Volver</ThemedText>
            </TouchableOpacity>
            <ThemedText type="title">{grupoSeleccionado}</ThemedText>
          </ThemedView>

          {/* Opción Rotativo */}
          <TouchableOpacity style={styles.opcionRotativo} onPress={seleccionarRotativo}>
            <ThemedText style={styles.opcionTexto}>🔀 Rotativo</ThemedText>
            <ThemedText style={styles.opcionDetalle}>
              Recorre los ejercicios de {grupoSeleccionado} uno a uno cada sesión
            </ThemedText>
          </TouchableOpacity>

          {ejerciciosGrupo.length === 0 ? (
            <ThemedText style={styles.vacio}>
              No hay ejercicios en este grupo todavía.
            </ThemedText>
          ) : (
            ejerciciosGrupo.map(ej => (
              <TouchableOpacity
                key={ej.id}
                style={styles.opcionCard}
                onPress={() => seleccionarEjercicioBiblioteca(ej)}>
                <ThemedText style={styles.opcionTexto}>
                  {TIPOS_EJERCICIO.find(t => t.id === ej.tipo)?.icono} {ej.nombre}
                </ThemedText>
                <ThemedText style={styles.opcionDetalle}>
                  {ej.series} series x {ej.repeticiones} {ej.temporizador ? 'seg' : 'reps'}
                  {ej.peso ? ` — ${ej.peso}kg` : ''}
                </ThemedText>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PASO: editar valores del ejercicio seleccionado
  if (paso === 'editarEjercicio') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <ThemedView style={styles.cabecera}>
            <TouchableOpacity onPress={() => setPaso(ejercicioEditando ? 'lista' : 'elegirEjercicio')}>
              <ThemedText style={styles.botonVolver}>← Volver</ThemedText>
            </TouchableOpacity>
            <ThemedText type="title">{formEjercicio.nombre}</ThemedText>
          </ThemedView>

          {!formEjercicio.rotativo && (
            <>
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
            </>
          )}

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
            <ThemedText style={styles.botonTexto}>✅ Añadir a la tabla</ThemedText>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // PASO: lista principal
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <ThemedView style={styles.cabecera}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.botonVolver}>← Volver</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">
            {modoEdicion ? 'Editar tabla' : 'Nueva tabla'}
          </ThemedText>
        </ThemedView>

        <ThemedText type="subtitle">Nombre de la tabla</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ej: Día de pecho"
          value={nombreTabla}
          onChangeText={setNombreTabla}
        />

        <ThemedText type="subtitle">Ejercicios</ThemedText>
        {ejercicios.length === 0 && (
          <ThemedText style={styles.vacio}>No hay ejercicios todavía</ThemedText>
        )}
        {ejercicios.map(ej => (
          <ThemedView key={ej.id} style={styles.ejercicioCard}>
            <ThemedView style={styles.ejercicioHeader}>
              <ThemedText style={styles.ejercicioNombre}>
                {ej.rotativo ? '🔀' : TIPOS_EJERCICIO.find(t => t.id === ej.tipo)?.icono} {ej.nombre}
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
          </ThemedView>
        ))}

        <TouchableOpacity style={styles.botonAñadir} onPress={() => setPaso('elegirGrupo')}>
          <ThemedText style={styles.botonTexto}>+ Añadir ejercicio</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonGuardar} onPress={guardarTabla}>
          <ThemedText style={styles.botonTexto}>
            {modoEdicion ? 'Guardar cambios' : 'Guardar tabla'}
          </ThemedText>
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
  vacio: { opacity: 0.5, textAlign: 'center', marginVertical: 16 },
  opcionCard: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 16, marginBottom: 8,
  },
  opcionRotativo: {
    borderWidth: 2, borderColor: '#208AEF', borderRadius: 10,
    padding: 16, marginBottom: 12,
  },
  opcionTexto: { fontSize: 16, fontWeight: 'bold' },
  opcionDetalle: { fontSize: 13, opacity: 0.7, marginTop: 4 },
  ejercicioCard: { padding: 12, borderRadius: 10, marginBottom: 8, gap: 4 },
  ejercicioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ejercicioNombre: { fontSize: 16, fontWeight: 'bold' },
  ejercicioAcciones: { flexDirection: 'row', gap: 8 },
  botonIcono: { fontSize: 18, padding: 4 },
  detalle: { fontSize: 13, opacity: 0.7, paddingLeft: 8 },
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
  botonTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});