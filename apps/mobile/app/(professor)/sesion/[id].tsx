import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME, PHASES } from '@iter/shared';
import { getAttendance, postAttendance, postIncidencia, getFases } from '../../../services/api';

interface Student {
  id: number;
  id_inscripcio: number;
  name: string;
  status: string;
  institute: string;
  permissions: string;
  flag?: boolean;
}

export default function SesionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [incidentModal, setIncidentModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');
  const [sessionNumber, setSessionNumber] = useState(4); // Default to current
  const [sessionModal, setSessionModal] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEjecucion, setIsEjecucion] = useState(false);
  const [assignmentInfo, setAssignmentInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fasesRes, attendanceRes] = await Promise.all([
          getFases(),
          getAttendance(id as string)
        ]);

        const active = fasesRes.data.data.find((f: any) => f.nom === PHASES.EJECUCION)?.activa;
        setIsEjecucion(!!active);

        const attendanceData = attendanceRes.data;
        if (attendanceData.length > 0) {
          setAssignmentInfo(attendanceData[0].inscripcio.assignacio);
          
          const mapped = attendanceData.map((a: any) => ({
            id: a.inscripcio.id_alumne,
            id_inscripcio: a.id_inscripcio,
            name: `${a.inscripcio.alumne.nom} ${a.inscripcio.alumne.cognoms}`,
            status: a.estat.toLowerCase(),
            institute: a.inscripcio.alumne.centre_procedencia?.nom || 'Centro N/A',
            permissions: 'Permís estàndard'
          }));
          setStudents(mapped);
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const updateStatus = async (studentId: number, idInscripcio: number, newStatus: string) => {
    if (!isEjecucion) {
      Alert.alert('Fase No Activa', 'Només es pot registrar assistència durant la fase d\'execució.');
      return;
    }

    try {
      const estatMapeado = newStatus === 'late' ? 'Retard' : newStatus === 'present' ? 'Present' : 'Absència';
      
      await postAttendance({
        id_inscripcio: idInscripcio,
        numero_sessio: sessionNumber,
        data_sessio: new Date().toISOString().split('T')[0],
        estat: estatMapeado,
        observacions: ''
      });

      setStudents(students.map(s => 
        s.id === studentId ? { ...s, status: newStatus, flag: newStatus === 'absent' } : s
      ));
    } catch (error) {
      Alert.alert('Error', 'No s\'ha pogut desar l\'assistència.');
    }
  };

  const handleReportIncidencía = async () => {
    if (!incidentText.trim()) return;
    try {
      await postIncidencia({
        id_centre: assignmentInfo.id_centre,
        descripcio: `[Assignació ${id}] - Sessió ${sessionNumber}: ${incidentText}`
      });
      setIncidentModal(false);
      setIncidentText('');
      Alert.alert('Èxit', 'Incidència reportada correctament.');
    } catch (error) {
      Alert.alert('Error', 'No s\'ha pogut reportar la incidència.');
    }
  };

  const toggleFlag = (studentId: number) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, flag: !s.flag } : s
    ));
  };

  const getStatusBorder = (status: string) => {
    if (status.includes('retard')) return 'border-yellow-500';
    if (status.includes('abs')) return 'border-red-600';
    if (status.includes('pres')) return 'border-green-600';
    return 'border-gray-300';
  };

  const getStatusLabel = (status: string) => {
    if (status.includes('retard')) return 'RETARD';
    if (status.includes('abs')) return 'ABSENT';
    if (status.includes('pres')) return 'PRESENT';
    return 'PENDENT';
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FAFB]">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFB] pt-4">

      <View className="flex-1 px-6 pt-8">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-lg font-bold text-gray-800 tracking-tight">Alumnes ({students.length})</Text>
          <TouchableOpacity 
            onPress={() => setIncidentModal(true)}
            className="bg-red-50 px-4 py-2 flex-row items-center border border-red-100"
          >
            <Ionicons name="warning" size={16} color="#EF4444" />
            <Text className="text-[#EF4444] font-bold text-xs uppercase tracking-wider ml-2">Incidència</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {students.map((student) => (
            <View key={student.id} className="bg-white p-5 border border-gray-200 mb-4">
              <View className="flex-row justify-between items-start mb-6">
                <TouchableOpacity onPress={() => { setSelectedStudent(student); setModalVisible(true); }} className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 tracking-tight">{student.name}</Text>
                  <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider mt-1">{student.institute}</Text>
                </TouchableOpacity>
                <View className={`px-2 py-0.5 border ${getStatusBorder(student.status)}`}>
                  <Text className="font-bold text-[8px] tracking-wider">{getStatusLabel(student.status)}</Text>
                </View>
              </View>

              <View className="flex-row space-x-2">
                <TouchableOpacity 
                  onPress={() => updateStatus(student.id, student.id_inscripcio, 'present')}
                  className={`flex-1 py-3 items-center border-2 ${student.status.includes('pres') ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200'}`}
                >
                  <Ionicons name="checkmark" size={18} color={student.status.includes('pres') ? 'white' : '#10B981'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => updateStatus(student.id, student.id_inscripcio, 'late')}
                  className={`flex-1 py-3 items-center border-2 ${student.status.includes('retard') ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-200'}`}
                >
                  <Ionicons name="time" size={18} color={student.status.includes('retard') ? 'white' : '#F59E0B'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => updateStatus(student.id, student.id_inscripcio, 'absent')}
                  className={`flex-1 py-3 items-center border-2 ${student.status.includes('abs') ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200'}`}
                >
                  <Ionicons name="close" size={18} color={student.status.includes('abs') ? 'white' : '#EF4444'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => toggleFlag(student.id)}
                  className={`px-4 py-3 items-center border ${student.flag ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}
                >
                  <Ionicons name="flag" size={18} color={student.flag ? '#EF4444' : '#9CA3AF'} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Student Info Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center bg-black/40 px-6">
          <View className="bg-white border border-gray-200 p-8">
            {selectedStudent && (
              <>
                <Text className="text-sm font-black text-secondary mb-2 uppercase tracking-[2px]">FITXA ALUMNE</Text>
                <Text className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{selectedStudent.name}</Text>
                <Text className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">{selectedStudent.institute}</Text>
                
                <View className="bg-gray-100 p-6 mb-10 border-l-8 border-primary">
                  <Text className="text-xs text-gray-400 uppercase tracking-widest font-black mb-3">PERMISOS DE SORTIDA</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="information-circle" size={20} color={THEME.colors.primary} />
                    <Text className="text-gray-900 ml-3 font-black text-xs uppercase">{selectedStudent.permissions}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  className="bg-primary py-5 items-center"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-black text-sm uppercase tracking-widest">TANCAR</Text>
                </TouchableOpacity>
              </>
            )}
            <Text className="text-2xl font-bold text-[#00426B] mb-2 tracking-tight">Registrar Incidència</Text>
            <Text className="text-gray-500 text-sm mb-8 leading-5">Explica breument el problema detectat durant la sessió.</Text>
            
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 h-40 text-gray-900 font-medium text-sm mb-8"
              multiline
              placeholder="Escriu aquí..."
              textAlignVertical="top"
              value={incidentText}
              onChangeText={setIncidentText}
            />

            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="flex-1 py-4 items-center bg-gray-100"
                onPress={() => setIncidentModal(false)}
              >
                <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider">Cancel·lar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-[#F26178] py-4 items-center"
                onPress={handleReportIncidencía}
              >
                <Text className="text-white font-bold text-xs uppercase tracking-wider">Reportar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Session Selector Modal */}
      <Modal visible={sessionModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-6 pb-12 border-t border-gray-200">
            <Text className="text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-widest">Seleccionar Sessió</Text>
            <View className="flex-row flex-wrap justify-center">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <TouchableOpacity 
                  key={n}
                  onPress={() => { setSessionNumber(n); setSessionModal(false); }}
                  className={`w-14 h-14 m-2 items-center justify-center border ${sessionNumber === n ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                >
                  <Text className={`font-bold ${sessionNumber === n ? 'text-white' : 'text-gray-400'}`}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              onPress={() => setSessionModal(false)}
              className="mt-8 bg-gray-100 py-4 items-center border border-gray-200"
            >
              <Text className="text-gray-500 font-black uppercase tracking-widest">TANCAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
