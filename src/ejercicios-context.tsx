import ejerciciosBase from '@/data/ejercicios-base.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

export type EjercicioBiblioteca = {
  id: number;
  nombre: string;
  grupoMuscular: string;
  tipo: string;
  descripcion: string;
  series: string;
  repeticiones: string;
  descanso: string;
  peso: string;
  temporizador: boolean;
  imagen?: string;
};

export type GrupoMuscular = {
  id: number;
  nombre: string;
};

type EjerciciosContextType = {
  ejercicios: EjercicioBiblioteca[];
  grupos: GrupoMuscular[];
  añadirEjercicio: (ejercicio: Omit<EjercicioBiblioteca, 'id'>) => void;
  editarEjercicio: (id: number, ejercicio: Omit<EjercicioBiblioteca, 'id'>) => void;
  borrarEjercicio: (id: number) => void;
  añadirGrupo: (nombre: string) => void;
  borrarGrupo: (id: number) => void;
};

const EjerciciosContext = createContext<EjerciciosContextType | null>(null);

export function EjerciciosProvider({ children }: { children: React.ReactNode }) {
  const [ejercicios, setEjercicios] = useState<EjercicioBiblioteca[]>([]);
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [cargado, setCargado] = useState(false);

  // Cargar datos
  useEffect(() => {
    async function cargar() {
      try {
        const ej = await AsyncStorage.getItem('ejercicios_biblioteca');
        const gr = await AsyncStorage.getItem('grupos_musculares');
        const versionGuardada = await AsyncStorage.getItem('ejercicios_base_version');
        const versionActual = ejerciciosBase.version;

        if (gr) {
          setGrupos(JSON.parse(gr));
        } else {
          setGrupos(ejerciciosBase.grupos);
        }

        if (ej && versionGuardada && Number(versionGuardada) >= versionActual) {
          // Versión actualizada, cargar datos del usuario
          setEjercicios(JSON.parse(ej));
        } else {
          // Versión nueva del JSON, fusionar ejercicios base con los del usuario
          const ejerciciosUsuario = ej ? JSON.parse(ej).filter(e => e.id >= 1000) : [];
          const ejerciciosFusionados = [...ejerciciosUsuario, ...ejerciciosBase.ejercicios];
          setEjercicios(ejerciciosFusionados);
          await AsyncStorage.setItem('ejercicios_base_version', String(versionActual));
        }
      } catch (e) {
        console.error('Error cargando ejercicios:', e);
      } finally {
        setCargado(true);
      }
    }
    cargar();
  }, []);

  // Guardar ejercicios
  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem('ejercicios_biblioteca', JSON.stringify(ejercicios));
  }, [ejercicios]);

  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem('grupos_musculares', JSON.stringify(grupos));
  }, [grupos]);

  function añadirEjercicio(ejercicio: Omit<EjercicioBiblioteca, 'id'>) {
    setEjercicios(prev => [{ ...ejercicio, id: Date.now() }, ...prev]);
  }

  function editarEjercicio(id: number, ejercicio: Omit<EjercicioBiblioteca, 'id'>) {
    setEjercicios(prev => prev.map(e => e.id === id ? { ...ejercicio, id } : e));
  }

  function borrarEjercicio(id: number) {
    setEjercicios(prev => prev.filter(e => e.id !== id));
  }

  function añadirGrupo(nombre: string) {
    setGrupos(prev => [...prev, { id: Date.now(), nombre }]);
  }

  function borrarGrupo(id: number) {
    setGrupos(prev => prev.filter(g => g.id !== id));
  }

  return (
    <EjerciciosContext.Provider value={{
      ejercicios, grupos,
      añadirEjercicio, editarEjercicio, borrarEjercicio,
      añadirGrupo, borrarGrupo,
    }}>
      {children}
    </EjerciciosContext.Provider>
  );
}

export function useEjercicios() {
  const context = useContext(EjerciciosContext);
  if (!context) throw new Error('useEjercicios debe usarse dentro de EjerciciosProvider');
  return context;
}