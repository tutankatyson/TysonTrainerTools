import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

export type EjercicioHistorial = {
  nombre: string;
  tipo: string;
  series: number;
  repeticiones: string;
  peso: string;
  estrellas: number;
};

export type Sesion = {
  id: number;
  tablaId: number;
  tablaNombre: string;
  fecha: string;
  duracionMinutos: number;
  ejercicios: EjercicioHistorial[];
  estrellaMedia: number;
};

type HistorialContextType = {
  sesiones: Sesion[];
  guardarSesion: (sesion: Omit<Sesion, 'id'>) => void;
};

const HistorialContext = createContext<HistorialContextType | null>(null);

export function HistorialProvider({ children }: { children: React.ReactNode }) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await AsyncStorage.getItem('historial');
        if (datos) setSesiones(JSON.parse(datos));
      } catch (e) {
        console.error('Error cargando historial:', e);
      } finally {
        setCargado(true);
      }
    }
    cargar();
  }, []);

  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem('historial', JSON.stringify(sesiones));
  }, [sesiones]);

  function guardarSesion(sesion: Omit<Sesion, 'id'>) {
    setSesiones(prev => [...prev, { ...sesion, id: Date.now() }]);
  }

  return (
    <HistorialContext.Provider value={{ sesiones, guardarSesion }}>
      {children}
    </HistorialContext.Provider>
  );
}

export function useHistorial() {
  const context = useContext(HistorialContext);
  if (!context) throw new Error('useHistorial debe usarse dentro de HistorialProvider');
  return context;
}