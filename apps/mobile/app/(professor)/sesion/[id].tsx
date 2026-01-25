import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@iter/shared';
import api, { getChecklist, getStudents, postAttendance, getAttendance } from '../../../services/api';

export default function SessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{[key: string]: string}>({}); // 'PRESENT', 'ABSENT', 'RETARD'
  const [observations, setObservations] = useState('');
  const [sessionData, setSessionData] = useState<any>(null); // To store taller info if needed

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get List of Students
      const studentsRes = await getStudents(id as string);
      const studentsList = studentsRes.data;
      setStudents(studentsList);
      
      // 2. Initial state: Mark all as PRESENT by default (optional, distinct per preference)
      const initialAttendance: any = {};
      studentsList.forEach((s: any) => {
          initialAttendance[s.id_alumne] = 'PRESENT';
      });

      // 3. Check if attendance already exists (to pre-fill)
      try {
        const existingRes = await getAttendance(id as string);
        if (existingRes.data && existingRes.data.length > 0) {
            // Map existing data
            existingRes.data.forEach((record: any) => {
                initialAttendance[record.id_alumne] = record.estat;
            });
            if(existingRes.data[0].observacions) {
                setObservations(existingRes.data[0].observacions);
            }
        }
      } catch (err) {
        // No existing attendance, continue with defaults
      }

      setAttendance(initialAttendance);

    } catch (error) {
      console.error("Error fetching session data:", error);
      Alert.alert("Error", "No s'ha pogut carregar la llista d'alumnes.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => {
        const current = prev[studentId];
        let next = 'PRESENT';
        if (current === 'PRESENT') next = 'ABSENT';
        else if (current === 'ABSENT') next = 'RETARD';
        else if (current === 'RETARD') next = 'PRESENT';
        return { ...prev, [studentId]: next };
    });
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    try {
        const payload = Object.keys(attendance).map(studentId => ({
            id_assignacio: id,
            id_alumne: studentId,
            estat: attendance[studentId],
            observacions: observations
        }));

        // Send one by one or batch if API supports. 
        // Assuming batch or we iterate. The prompt implies "send to coordinators".
        // Let's assume the API handles bulk or we call `postAttendance` for the session.
        // Looking at api.ts: export const postAttendance = (data: any) => api.post('assistencia', data);
        // Usually expects an array or a single object. Let's try sending the array.
        
        await postAttendance({ assistencia: payload, id_assignacio: id }); 
        
        Alert.alert("Èxit", "Assistència enviada correctament als coordinadors.", [
            { text: "OK", onPress: () => router.back() }
        ]);
        
    } catch (error) {
        console.error("Error submitting attendance:", error);
        Alert.alert("Error", "No s'ha pogut enviar l'assistència.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-page">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      <Stack.Screen 
        options={{ 
          title: "Llista d'alumnes",
          headerBackTitle: "Tornar",
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
         
         <Text className="text-text-secondary text-sm mb-6 font-medium">
            Marca l'assistència dels alumnes. Prem sobre l'estat per canviar-lo.
         </Text>

         {students.map((student) => {
             const status = attendance[student.id_alumne];
             // Using simpler colors for "line of the app" - cleaner look
             let statusColor = "bg-background-surface text-emerald-700 border-emerald-100";  // Badge on gray bg
             let statusIcon = "checkmark-circle";
             
             if (status === 'ABSENT') {
                 statusColor = "bg-background-surface text-rose-700 border-rose-100";
                 statusIcon = "close-circle";
             } else if (status === 'RETARD') {
                 statusColor = "bg-background-surface text-amber-700 border-amber-100";
                 statusIcon = "time";
             }

             return (
                 <TouchableOpacity 
                    key={student.id_alumne} 
                    onPress={() => toggleStatus(String(student.id_alumne))}
                    activeOpacity={0.7}
                    className="bg-background-subtle p-5 rounded-3xl mb-3 flex-row items-center justify-between"
                 >
                    <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 bg-background-surface rounded-full items-center justify-center mr-4">
                            <Text className="font-bold text-text-muted text-lg">{student.nom.charAt(0)}</Text>
                        </View>
                        <View className="flex-1 mr-2">
                            <Text className="font-bold text-text-primary text-base mb-0.5" numberOfLines={1} ellipsizeMode="tail">
                                {student.nom} {student.cognoms}
                            </Text>
                            <Text className="text-text-muted text-xs font-medium tracking-wide">ID: {student.idalu}</Text>
                        </View>
                    </View>

                    <View className={`px-3 py-1.5 rounded-full border flex-row items-center ${statusColor.split(' ')[0]} ${statusColor.split(' ')[2]}`}>
                        <Ionicons name={statusIcon as any} size={14} color={status === 'ABSENT' ? '#BE123C' : status === 'RETARD' ? '#B45309' : '#047857'} />
                        <Text className={`font-bold text-[10px] ml-1.5 uppercase tracking-wider ${statusColor.split(' ')[1]}`}>
                            {status}
                        </Text>
                    </View>
                 </TouchableOpacity>
             );
         })}

         {/* Observations */}
         <View className="mt-6 mb-24">
            <Text className="text-text-primary font-bold mb-3 ml-1">Observacions Generals</Text>
            <TextInput 
                className="bg-background-subtle p-5 rounded-3xl text-text-primary h-32 leading-6 border border-border-subtle"
                multiline
                textAlignVertical="top"
                placeholder="Escriu aquí qualsevol incidència o comentari sobre la sessió..."
                placeholderTextColor={THEME.colors.gray}
                value={observations}
                onChangeText={setObservations}
            />
         </View>

      </ScrollView>

      {/* Footer Action */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-background-surface border-t border-border-subtle">
         <TouchableOpacity 
            onPress={submitAttendance}
            disabled={submitting}
            className={`w-full h-14 rounded-2xl items-center justify-center shadow-lg ${submitting ? 'bg-background-subtle' : 'bg-primary shadow-slate-200'}`}
         >
             {submitting ? (
                 <ActivityIndicator color="white" />
             ) : (
                 <Text className="text-white text-lg font-bold tracking-wide uppercase">Finalitzar i Enviar</Text>
             )}
         </TouchableOpacity>
      </View>

    </View>
  );
}
