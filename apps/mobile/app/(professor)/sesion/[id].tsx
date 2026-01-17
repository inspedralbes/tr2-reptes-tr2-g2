import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME } from '@iter/shared';

export default function SesionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [incidentModal, setIncidentModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');

  const [students, setStudents] = useState([
    { id: 1, name: 'Pau Claris', status: 'pending', institute: 'Inst. Martí i Pous', permissions: 'Vuelve solo a casa' },
    { id: 2, name: 'Laia Sanz', status: 'present', institute: 'Inst. Bosc de Montjuïc', permissions: 'Recogida por tutor' },
    { id: 3, name: 'Èric Vila', status: 'absent', institute: 'Inst. Martí i Pous', permissions: 'Vuelve solo a casa', flag: true },
    { id: 4, name: 'Alba Ruiz', status: 'late', institute: 'Inst. Bosc de Montjuïc', permissions: 'Vuelve solo a casa' },
    { id: 5, name: 'Marc Font', status: 'pending', institute: 'Inst. Martí i Pous', permissions: 'Recogida por tutor' },
  ]);

  const updateStatus = (studentId, newStatus) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, status: newStatus, flag: newStatus === 'absent' } : s
    ));
    setModalVisible(false);
  };

  const toggleFlag = (studentId) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, flag: !s.flag } : s
    ));
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'present': return 'border-green-600';
      case 'late': return 'border-yellow-500';
      case 'absent': return 'border-red-600';
      default: return 'border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'PRESENTE';
      case 'late': return 'RETRASO';
      case 'absent': return 'AUSENTE';
      default: return 'PENDIENTE';
    }
  };

  const openStudentInfo = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-6 pt-10 border-b-2 border-gray-900">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-6">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-black uppercase tracking-tight">PASE DE LISTA</Text>
        </View>
        <Text className="text-primary font-black text-xs uppercase tracking-widest mb-1">Taller de Robótica Avanzada</Text>
        <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Sesión 4/12 • 19 de Enero</Text>
      </View>

      <View className="flex-1 bg-gray-50 px-6 pt-8">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-lg font-black text-gray-900 uppercase">ALUMNOS ({students.length})</Text>
          <TouchableOpacity 
            onPress={() => setIncidentModal(true)}
            className="bg-accent px-4 py-3 flex-row items-center"
          >
            <Ionicons name="warning" size={16} color="white" />
            <Text className="text-white font-black text-[10px] uppercase tracking-widest ml-2">INCIDENCIA</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {students.map((student) => (
            <View key={student.id} className="bg-white p-5 border-2 border-gray-900 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
              <View className="flex-row justify-between items-start mb-6">
                <TouchableOpacity onPress={() => openStudentInfo(student)} className="flex-1">
                  <Text className="text-lg font-black text-gray-900 uppercase tracking-tight">{student.name}</Text>
                  <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">{student.institute}</Text>
                </TouchableOpacity>
                <View className={`px-2 py-1 border-2 ${getStatusBorder(student.status)}`}>
                  <Text className="font-black text-[9px] tracking-widest">{getStatusLabel(student.status)}</Text>
                </View>
              </View>

              <View className="flex-row space-x-2">
                <TouchableOpacity 
                  onPress={() => updateStatus(student.id, 'present')}
                  className={`flex-1 py-3 items-center border-2 ${student.status === 'present' ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200'}`}
                >
                  <Ionicons name="checkmark" size={18} color={student.status === 'present' ? 'white' : '#10B981'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => updateStatus(student.id, 'late')}
                  className={`flex-1 py-3 items-center border-2 ${student.status === 'late' ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-200'}`}
                >
                  <Ionicons name="time" size={18} color={student.status === 'late' ? 'white' : '#F59E0B'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => updateStatus(student.id, 'absent')}
                  className={`flex-1 py-3 items-center border-2 ${student.status === 'absent' ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200'}`}
                >
                  <Ionicons name="close" size={18} color={student.status === 'absent' ? 'white' : '#EF4444'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => toggleFlag(student.id)}
                  className={`px-4 py-3 items-center border-2 ${student.flag ? 'bg-accent border-accent' : 'bg-white border-gray-200'}`}
                >
                  <Ionicons name="flag" size={18} color={student.flag ? 'white' : '#F26178'} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Student Info Modal */}
      <Modal visible={modalVisible} animationType="none" transparent={true}>
        <View className="flex-1 justify-center bg-gray-900/80 px-6">
          <View className="bg-white border-4 border-gray-900 p-8">
            {selectedStudent && (
              <>
                <Text className="text-sm font-black text-secondary mb-2 uppercase tracking-[2px]">FICHA ALUMNO</Text>
                <Text className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{selectedStudent.name}</Text>
                <Text className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">{selectedStudent.institute}</Text>
                
                <View className="bg-gray-100 p-6 mb-10 border-l-8 border-primary">
                  <Text className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-3">PERMISOS DE SALIDA</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="information-circle" size={20} color={THEME.colors.primary} />
                    <Text className="text-gray-900 ml-3 font-black text-xs uppercase">{selectedStudent.permissions}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  className="bg-primary py-5 items-center"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-black text-sm uppercase tracking-widest">CERRAR</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Incident Modal */}
      <Modal visible={incidentModal} animationType="none" transparent={true}>
        <View className="flex-1 justify-center bg-gray-900/90 px-6">
          <View className="bg-white border-4 border-gray-900 p-8">
            <Text className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">REGISTRAR INCIDENCIA</Text>
            <Text className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-[10px]">Describa brevemente el problema de comportamiento.</Text>
            
            <TextInput 
              className="bg-gray-50 border-2 border-gray-200 p-5 h-40 text-gray-900 font-bold text-xs mb-8"
              multiline
              placeholder="Escribe aquí..."
              textAlignVertical="top"
              value={incidentText}
              onChangeText={setIncidentText}
            />

            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="flex-1 py-5 items-center border-2 border-gray-200"
                onPress={() => setIncidentModal(false)}
              >
                <Text className="text-gray-400 font-black text-xs uppercase tracking-widest">CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-accent py-5 items-center"
                onPress={() => {
                  setIncidentModal(false);
                  setIncidentText('');
                }}
              >
                <Text className="text-white font-black text-xs uppercase tracking-widest">REPORTAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
