

import { EjerciciosProvider } from '@/ejercicios-context';
import { FotosProvider } from '@/fotos-context';
import { HistorialProvider } from '@/historial-context';
import { TablasProvider } from '@/tablas-context';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <EjerciciosProvider>
      <TablasProvider>
        <HistorialProvider>
          <FotosProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Tabs>
                <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
                <Tabs.Screen name="ejercicios" options={{ title: 'Ejercicios' }} />
                <Tabs.Screen name="tablas" options={{ title: 'Tablas' }} />
                <Tabs.Screen name="historial" options={{ title: 'Historial' }} />
                <Tabs.Screen name="fotos" options={{ title: 'Fotos' }} />
                <Tabs.Screen name="gestionar-tabla" options={{ href: null }} />
                <Tabs.Screen name="entrenar" options={{ href: null }} />
                <Tabs.Screen name="editar-tabla" options={{ href: null }} />
                <Tabs.Screen name="nueva-tabla" options={{ href: null }} />
                <Tabs.Screen name="videos" options={{title: 'Videos', tabBarIcon: ({ color, size }) => (<Ionicons name="videocam" size={size} color={color} />),}}/>
              </Tabs>
            </ThemeProvider>
          </FotosProvider>
        </HistorialProvider>
      </TablasProvider>
    </EjerciciosProvider>
  );
}