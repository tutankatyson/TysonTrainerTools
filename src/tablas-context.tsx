import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

export type Ejercicio = {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  series: string;
  repeticiones: string;
  descanso: string;
  peso: string;
  temporizador: boolean;
  imagen?: string;
  grupoMuscular?: string;
  rotativo?: boolean;
  ejercicioBibliotecaId?: number;
};

export type Tabla = {
  id: number;
  nombre: string;
  ejercicios: Ejercicio[];
  contadoresRotativos: Record<string, number>;
};

type TablasContextType = {
  tablas: Tabla[];
  añadirTabla: (tabla: Omit<Tabla, 'id'>) => void;
  borrarTabla: (id: number) => void;
  editarTabla: (id: number, tabla: Omit<Tabla, 'id'>) => void;
  avanzarRotativo: (tablaId: number, grupoMuscular: string, total: number) => void;
};

const TablasContext = createContext<TablasContextType | null>(null);

const STORAGE_KEY = 'tablas';

export function TablasProvider({ children }: { children: React.ReactNode }) {
  const [tablas, setTablas] = useState<Tabla[]>([]);

  // Cargar tablas al arrancar
  useEffect(() => {
    async function cargar() {
      try {
        const datos = await AsyncStorage.getItem(STORAGE_KEY);
        if (datos) setTablas(JSON.parse(datos));
      } catch (e) {
        console.error('Error cargando tablas:', e);
      }
    }
    cargar();
  }, []);

  // Guardar tablas cada vez que cambien
  useEffect(() => {
    async function guardar() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tablas));
      } catch (e) {
        console.error('Error guardando tablas:', e);
      }
    }
    guardar();
  }, [tablas]);

  function añadirTabla(tabla: Omit<Tabla, 'id'>) {
    setTablas(prev => [...prev, { ...tabla, id: Date.now(), contadoresRotativos: {} }]);
  }

  function avanzarRotativo(tablaId: number, grupoMuscular: string, total: number) {
    setTablas(prev => prev.map(t => {
      if (t.id !== tablaId) return t;
      const actual = t.contadoresRotativos?.[grupoMuscular] ?? 0;
      return {
        ...t,
        contadoresRotativos: {
          ...t.contadoresRotativos,
          [grupoMuscular]: (actual + 1) % total,
        },
      };
    }));
  }

  function borrarTabla(id: number) {
    setTablas(prev => prev.filter(t => t.id !== id));
  }

  function editarTabla(id: number, tabla: Omit<Tabla, 'id'>) {
    setTablas(prev => prev.map(t => t.id === id ? { ...tabla, id } : t));
  }

  return (
    <TablasContext.Provider value={{ tablas, añadirTabla, borrarTabla, editarTabla, avanzarRotativo }}>
      {children}
    </TablasContext.Provider>
  );
}

export function useTablas() {
  const context = useContext(TablasContext);
  if (!context) throw new Error('useTablas debe usarse dentro de TablasProvider');
  return context;
}