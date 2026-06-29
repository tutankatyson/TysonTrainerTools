import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

export type FotoDiaria = {
  id: number;
  uri: string;
  fecha: string;
  peso?: string;
};

type FotosContextType = {
  fotos: FotoDiaria[];
  añadirFoto: (foto: Omit<FotoDiaria, 'id'>) => void;
  borrarFoto: (id: number) => void;
};

const FotosContext = createContext<FotosContextType | null>(null);

export function FotosProvider({ children }: { children: React.ReactNode }) {
  const [fotos, setFotos] = useState<FotoDiaria[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await AsyncStorage.getItem('fotos_diarias');
        if (datos) setFotos(JSON.parse(datos));
      } catch (e) {
        console.error('Error cargando fotos:', e);
      } finally {
        setCargado(true);
      }
    }
    cargar();
  }, []);

  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem('fotos_diarias', JSON.stringify(fotos));
  }, [fotos]);

  function añadirFoto(foto: Omit<FotoDiaria, 'id'>) {
    setFotos(prev => [...prev, { ...foto, id: Date.now() }]);
  }

  function borrarFoto(id: number) {
    setFotos(prev => prev.filter(f => f.id !== id));
  }

  return (
    <FotosContext.Provider value={{ fotos, añadirFoto, borrarFoto }}>
      {children}
    </FotosContext.Provider>
  );
}

export function useFotos() {
  const context = useContext(FotosContext);
  if (!context) throw new Error('useFotos debe usarse dentro de FotosProvider');
  return context;
}