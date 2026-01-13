import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Colors extrets directament de la web del Consorci
const CEB_BLUE = '#005985'; // Blau fosc corporatiu
const CEB_TEXT = '#333333'; // Gris fosc per a lectura
const CEB_BORDER = '#E5E7EB'; // Gris clar per a línies

export default function Profile() {
  const { authState, logout } = useAuth();
  const { user } = authState;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <Stack.Screen 
        options={{ 
            headerShown: false, // Ocultem la barra nativa per fer la nostra pròpia "Web Header"
        }} 
      />
      
      <View className="flex-1 px-5 pt-12 pb-10">
        

        {/* 2. TÍTOL PÀGINA - Estil "El Consorci" (Gran, blau i prim) */}
        <View className="border-b border-gray-300 pb-2 mb-8">
            <Text 
                className="text-3xl font-light"
                style={{ color: CEB_BLUE }}
            >
                El meu perfil
            </Text>
        </View>

        {/* 3. FITXA USUARI - Estil recte */}
        <View className="flex-row items-start mb-10">
            {/* Quadrat sòlid per la imatge */}
            <View 
                className="h-24 w-24 items-center justify-center mr-6"
                style={{ backgroundColor: CEB_BLUE }}
            >
                <Text className="text-3xl text-white font-serif">
                  {getInitials(user?.nombre)}
                </Text>
            </View>
            
            <View className="flex-1 pt-1">
                <Text className="text-xl font-bold text-gray-800 uppercase tracking-tight mb-2">
                    {user?.nombre || 'NOM USUARI'}
                </Text>
                <View className="flex-row items-center mb-1">
                    <Ionicons name="mail-sharp" size={14} color="#666" style={{marginRight: 6}} />
                    <Text className="text-sm text-gray-600">{user?.email || 'email@exemple.cat'}</Text>
                </View>
                <View className="bg-gray-100 self-start px-2 py-1 mt-2">
                     <Text className="text-xs text-gray-500 uppercase">Compte Actiu</Text>
                </View>
            </View>
        </View>

        {/* 4. TAULA DE DADES - Imitant el "Menú Lateral" de la web */}
        {/* Secció 1: Dades */}
        <View className="mb-8">
            {/* Capçalera Blava */}
            <View className="py-2 px-3" style={{ backgroundColor: CEB_BLUE }}>
                <Text className="text-white font-bold text-sm uppercase">
                    Dades de referència
                </Text>
            </View>
            
            {/* Files de la taula (Bordes grisos) */}
            <View className="border-l border-r border-b border-gray-300">
                {/* ID Centre */}
                <View className="flex-row border-b border-gray-200 bg-white">
                    <View className="w-1/3 bg-gray-50 p-3 border-r border-gray-200 justify-center">
                        <Text className="text-xs font-bold text-gray-600 uppercase">Centre Educatiu</Text>
                    </View>
                    <View className="flex-1 p-3 justify-center">
                         <Text className="text-sm text-gray-900 font-medium">{user?.centro_id || 'Sense assignar'}</Text>
                    </View>
                </View>

                {/* ID Usuari */}
                <View className="flex-row bg-white">
                    <View className="w-1/3 bg-gray-50 p-3 border-r border-gray-200 justify-center">
                        <Text className="text-xs font-bold text-gray-600 uppercase">ID Usuari</Text>
                    </View>
                    <View className="flex-1 p-3 justify-center">
                         <Text className="text-sm text-gray-900 font-medium">{user?.id || '--'}</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Secció 2: Accions */}
        <View>
            <View className="py-2 px-3" style={{ backgroundColor: CEB_BLUE }}>
                <Text className="text-white font-bold text-sm uppercase">
                    Gestió
                </Text>
            </View>
            
            <View className="border-l border-r border-b border-gray-300">
                <TouchableOpacity 
                    onPress={handleLogout}
                    className="flex-row items-center p-4 bg-white hover:bg-gray-50 active:bg-gray-100"
                >
                    <Ionicons name="log-out-sharp" size={18} color="#C8102E" />
                    <Text className="ml-3 text-sm font-bold text-gray-700 uppercase">
                        Tancar la sessió
                    </Text>
                    <View className="flex-1 items-end">
                        <Ionicons name="chevron-forward-sharp" size={16} color="#999" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>

      </View>
    </ScrollView>
  );
}