import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEjercicios } from '@/ejercicios-context';
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
  nombre: '', grupoMuscular: '', tipo: '', descripcion: '',
  series: '', repeticiones: '', descanso: '', peso: '', temporizador: false,
};

export default function EjerciciosScreen() {
  const { ejercicios, grupos, añadirEjercicio, editarEjercicio, borrarEjercicio, añadirGrupo, borrarGrupo } = useEjercicios();

  const [grupoAbierto, setGrupoAbierto] = useState<number | null>(null);
  const [mostrarFormGrupo, setMostrarFormGrupo] = useState(false);
  const [nuevoGrupo, setNuevoGrupo] = useState('');
  const [mostrarFormEjercicio, setMostrarFormEjercicio] = useState(false);
  const [ejercicioEditando, setEjercicioEditando] = useState<number | null>(null);
  const [formEjercicio, setFormEjercicio] = useState({ ...EJERCICIO_VACIO });

  function abrirFormNuevoEjercicio(grupoId: number) {
    const grupo = grupos.find(g => g.id === grupoId);
    setFormEjercicio({ ...EJERCICIO_VACIO, grupoMuscular: grupo?.nombre || '' });
    setEjercicioEditando(null);
    setMostrarFormEjercicio(true);
  }

  function abrirFormEditarEjercicio(ej: any) {
    setFormEjercicio({ ...ej });
    setEjercicioEditando(ej.id);
    setMostrarFormEjercicio(true);
  }

  function guardarEjercicio() {
    if (!formEjercicio.nombre || !formEjercicio.tipo) return;
    if (ejercicioEditando !== null) {
      editarEjercicio(ejercicioEditando, formEjercicio);
    } else {
      añadirEjercicio(formEjercicio);
    }
    setMostrarFormEjercicio(false);
    setEjercicioEditando(null);
    setFormEjercicio({ ...EJERCICIO_VACIO });
  }

  function guardarGrupo() {
    if (!nuevoGrupo.trim()) return;
    añadirGrupo(nuevoGrupo.trim());
    setNuevoGrupo('');
    setMostrarFormGrupo(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <ThemedText type="title" style={styles.titulo}>Ejercicios</ThemedText>

        {/* Botón nuevo grupo */}
        <TouchableOpacity style={styles.botonNuevo} onPress={() => setMostrarFormGrupo(true)}>
          <ThemedText style={styles.botonTexto}>+ Nuevo grupo muscular</ThemedText>
        </TouchableOpacity>

        {/* Form nuevo grupo */}
        {mostrarFormGrupo && (
          <ThemedView style={styles.formGrupo}>
            <TextInput
              style={styles.input}
              placeholder="Ej: Pecho, Espalda, Pierna..."
              value={nuevoGrupo}
              onChangeText={setNuevoGrupo}
              autoFocus
            />
            <ThemedView style={styles.formGrupoAcciones}>
              <TouchableOpacity style={styles.botonGuardar} onPress={guardarGrupo}>
                <ThemedText style={styles.botonTexto}>Guardar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setMostrarFormGrupo(false)}>
                <ThemedText style={styles.botonCancelarTexto}>Cancelar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}

        {/* Lista de grupos */}
        {grupos.length === 0 ? (
          <ThemedText style={styles.vacio}>No hay grupos musculares todavía</ThemedText>
        ) : (
          grupos.map(grupo => {
            const ejerciciosGrupo = ejercicios.filter(e => e.grupoMuscular === grupo.nombre);
            const abierto = grupoAbierto === grupo.id;

            return (
              <ThemedView key={grupo.id} style={styles.grupoCard}>

                {/* Cabecera grupo */}
                <ThemedView style={styles.grupoHeader}>
                  <TouchableOpacity
                    style={styles.grupoTitulo}
                    onPress={() => setGrupoAbierto(abierto ? null : grupo.id)}>
                    <ThemedText type="subtitle">{abierto ? '▼' : '▶'} {grupo.nombre}</ThemedText>
                    <ThemedText style={styles.contador}>{ejerciciosGrupo.length} ejercicios</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    if (window.confirm(`¿Borrar el grupo "${grupo.nombre}"?`)) {
                      borrarGrupo(grupo.id);
                    }
                  }}>
                    <ThemedText style={styles.botonIcono}>🗑️</ThemedText>
                  </TouchableOpacity>
                </ThemedView>

                {/* Ejercicios del grupo */}
                {abierto && (
                  <ThemedView style={styles.ejerciciosList}>
                    {ejerciciosGrupo.length === 0 ? (
                      <ThemedText style={styles.vacio}>No hay ejercicios en este grupo</ThemedText>
                    ) : (
                      ejerciciosGrupo.map(ej => (
                        <ThemedView key={ej.id} style={styles.ejercicioCard}>
                          <ThemedView style={styles.ejercicioHeader}>
                            <ThemedText style={styles.ejercicioNombre}>
                              {TIPOS_EJERCICIO.find(t => t.id === ej.tipo)?.icono} {ej.nombre}
                            </ThemedText>
                            <ThemedView style={styles.ejercicioAcciones}>
                              <TouchableOpacity onPress={() => abrirFormEditarEjercicio(ej)}>
                                <ThemedText style={styles.botonIcono}>✏️</ThemedText>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => {
                                if (window.confirm(`¿Borrar "${ej.nombre}"?`)) {
                                  borrarEjercicio(ej.id);
                                }
                              }}>
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
                      ))
                    )}

                    {/* Botón añadir ejercicio al grupo */}
                    {!mostrarFormEjercicio && (
                      <TouchableOpacity
                        style={styles.botonAñadir}
                        onPress={() => abrirFormNuevoEjercicio(grupo.id)}>
                        <ThemedText style={styles.botonTexto}>+ Añadir ejercicio</ThemedText>
                      </TouchableOpacity>
                    )}
                  </ThemedView>
                )}

              </ThemedView>
            );
          })
        )}

        {/* Formulario ejercicio */}
        {mostrarFormEjercicio && (
          <ThemedView style={styles.formEjercicio}>
            <ThemedText type="subtitle">
              {ejercicioEditando !== null ? 'Editar ejercicio' : 'Nuevo ejercicio'}
            </ThemedText>

            <ThemedText type="subtitle">Nombre</ThemedText>
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

            <TouchableOpacity style={styles.botonCancelar} onPress={() => {
              setMostrarFormEjercicio(false);
              setEjercicioEditando(null);
            }}>
              <ThemedText style={styles.botonCancelarTexto}>Cancelar</ThemedText>
            </TouchableOpacity>

          </ThemedView>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { marginBottom: 16 },
  botonNuevo: {
    backgroundColor: '#208AEF', padding: 16, borderRadius: 10,
    alignItems: 'center', marginBottom: 16,
  },
  botonTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  formGrupo: { marginBottom: 16, gap: 8 },
  formGrupoAcciones: { flexDirection: 'row', gap: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 12, fontSize: 16, marginTop: 8, marginBottom: 16,
  },
  inputMultilinea: { height: 80, textAlignVertical: 'top' },
  vacio: { opacity: 0.5, textAlign: 'center', marginVertical: 16 },
  grupoCard: { borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  grupoHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  grupoTitulo: { flex: 1, gap: 4 },
  contador: { fontSize: 12, opacity: 0.6 },
  botonIcono: { fontSize: 18, padding: 4 },
  ejerciciosList: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  ejercicioCard: { padding: 12, borderRadius: 10, marginBottom: 4 },
  ejercicioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ejercicioNombre: { fontSize: 15, fontWeight: 'bold' },
  ejercicioAcciones: { flexDirection: 'row', gap: 8 },
  detalle: { fontSize: 13, opacity: 0.7, paddingLeft: 8 },
  botonAñadir: {
    borderWidth: 2, borderColor: '#208AEF', borderStyle: 'dashed',
    borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8,
  },
  formEjercicio: { padding: 16, borderRadius: 10, marginBottom: 16 },
  tiposContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tipoBoton: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 16 },
  tipoSeleccionado: { borderColor: '#208AEF', backgroundColor: '#E6F4FE' },
  seriesContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  seriescampo: { flex: 1 },
  por: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  botonGuardar: {
    backgroundColor: '#208AEF', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  botonCancelar: {
    borderWidth: 1, borderColor: '#ccc', padding: 16,
    borderRadius: 10, alignItems: 'center', marginBottom: 16,
  },
  botonCancelarTexto: { fontSize: 16, opacity: 0.6 },
});