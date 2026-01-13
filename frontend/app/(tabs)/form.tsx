import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import alumneService, { Alumne } from '@/services/alumneService';
import tallerService, { Taller } from '@/services/tallerService';
import CenterSelection from '@/components/CenterSelection';
import StudentList from '@/components/StudentList';
import TermProjects from '@/components/TermProjects';
import AvailabilitySelection from '@/components/AvailabilitySelection';
import CommentsSection from '@/components/CommentsSection';
import AssignmentModal from '@/components/AssignmentModal';

export default function FormScreen() {
    const router = useRouter();

    // Data State
    const [allStudents, setAllStudents] = useState<Alumne[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Alumne[]>([]);
    const [centers, setCenters] = useState<string[]>([]);
    const [talleres, setTalleres] = useState<Taller[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        centerName: '',
        selectedStudents: [] as string[], // IDs of selected students
        coordinatorName: '',
        coordinatorEmail: '',
        isFirstTime: false,
        projects2ndTerm: {} as Record<string, { count: string, selectedStudents: string[] }>,
        referentProjects2ndTerm: [] as string[],
        referentName2nd: '',
        referentEmail2nd: '',
        availability: '',
        projects3rdTerm: {} as Record<string, { count: string, selectedStudents: string[] }>,
        referentProjects3rdTerm: [] as string[],
        referentName3rd: '',
        referentEmail3rd: '',
        comments: ''
    });

    // Modal State for Project Assignment
    const [modalVisible, setModalVisible] = useState(false);
    const [currentProjectSelection, setCurrentProjectSelection] = useState<{ term: '2nd' | '3rd', project: string } | null>(null);
    const [showCenterDropdown, setShowCenterDropdown] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Filter Students when Center changes
    useEffect(() => {
        if (formData.centerName) {
            const normalizedCenter = formData.centerName.toLowerCase().trim();
            if (allStudents.length > 0) {
                const filteredS = allStudents.filter(student =>
                    student.centro.toLowerCase().trim() === normalizedCenter
                );
                setFilteredStudents(filteredS);
            }
        } else {
            setFilteredStudents([]);
        }
    }, [formData.centerName, allStudents]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsData, talleresData] = await Promise.all([
                alumneService.getAll(),
                tallerService.getAll()
            ]);

            setAllStudents(studentsData);
            setTalleres(talleresData);

            // Extract unique centers
            if (studentsData && studentsData.length > 0) {
                const uniqueCenters = Array.from(new Set(studentsData.map(s => s.centro))).sort();
                setCenters(uniqueCenters);
            }

        } catch (error) {
            console.error("Failed to fetch data:", error);
            Alert.alert("Error", "No s'ha pogut connectar amb el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Helper Functions
    const toggleStudentSelection = (studentId: string) => {
        setFormData(prev => {
            const currentSelected = prev.selectedStudents;
            if (currentSelected.includes(studentId)) {
                return { ...prev, selectedStudents: currentSelected.filter(id => id !== studentId) };
            } else {
                return { ...prev, selectedStudents: [...currentSelected, studentId] };
            }
        });
    };

    const updateProjectCount = (term: '2nd' | '3rd', project: string, count: string) => {
        const key = term === '2nd' ? 'projects2ndTerm' : 'projects3rdTerm';
        setFormData(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [project]: { ...prev[key]?.[project], count }
            }
        }));
    };

    const openStudentSelection = (term: '2nd' | '3rd', project: string) => {
        setCurrentProjectSelection({ term, project });
        setModalVisible(true);
    };

    const toggleProjectStudent = (studentId: string) => {
        if (!currentProjectSelection) return;
        const { term, project } = currentProjectSelection;
        const key = term === '2nd' ? 'projects2ndTerm' : 'projects3rdTerm';

        setFormData(prev => {
            const projectData = prev[key][project] || { count: '0', selectedStudents: [] };
            const currentSelected = projectData.selectedStudents || [];
            let newSelected;
            if (currentSelected.includes(studentId)) {
                newSelected = currentSelected.filter(id => id !== studentId);
            } else {
                newSelected = [...currentSelected, studentId];
            }
            return {
                ...prev,
                [key]: {
                    ...prev[key],
                    [project]: { ...projectData, selectedStudents: newSelected }
                }
            };
        });
    };

    const toggleReferentProject = (term: '2nd' | '3rd', project: string) => {
        const key = term === '2nd' ? 'referentProjects2ndTerm' : 'referentProjects3rdTerm';
        setFormData(prev => {
            const currentList = prev[key];
            if (currentList.includes(project)) {
                return { ...prev, [key]: currentList.filter(p => p !== project) };
            } else {
                if (currentList.length >= 3) return prev; // Max 3
                return { ...prev, [key]: [...currentList, project] };
            }
        });
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#00426B" />
                <Text className="text-gray-600 mt-4">Carregant formulari...</Text>
            </SafeAreaView>
        );
    }

    const projects2nd = talleres.filter(t => t.trimestre === "2o Trimestre" || t.trimestre === "2" || t.trimestre === "2n");
    const projects3rd = talleres.filter(t => t.trimestre === "3o Trimestre" || t.trimestre === "3" || t.trimestre === "3r");
    const safeProjects2nd = projects2nd.length > 0 ? projects2nd : talleres; // Fallback if no filter match
    const safeProjects3rd = projects3rd.length > 0 ? projects3rd : talleres;



    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="mb-6 flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900 mb-2">Programa Enginy: Modalitat C</Text>
                        <Text className="text-gray-600">Formulari d'inscripció i selecció d'oficis</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-green-600 p-2 rounded-lg ml-4"
                        onPress={() => alert("Simulació: Crear Usuaris no implementat")}
                    >
                        <Text className="text-white font-bold">Crear Usuaris</Text>
                    </TouchableOpacity>
                </View>

                <CenterSelection
                  formData={formData}
                  setFormData={setFormData}
                  centers={centers}
                  showCenterDropdown={showCenterDropdown}
                  setShowCenterDropdown={setShowCenterDropdown}
                />
                <StudentList
                  formData={formData}
                  filteredStudents={filteredStudents}
                  toggleStudentSelection={toggleStudentSelection}
                />
                <TermProjects
                  term="2nd"
                  projects={safeProjects2nd}
                  formData={formData}
                  setFormData={setFormData}
                  updateProjectCount={updateProjectCount}
                  openStudentSelection={openStudentSelection}
                  toggleReferentProject={toggleReferentProject}
                />
                <TermProjects
                  term="3rd"
                  projects={safeProjects3rd}
                  formData={formData}
                  setFormData={setFormData}
                  updateProjectCount={updateProjectCount}
                  openStudentSelection={openStudentSelection}
                  toggleReferentProject={toggleReferentProject}
                />

                <AvailabilitySelection
                  formData={formData}
                  setFormData={setFormData}
                />

                <CommentsSection
                  formData={formData}
                  setFormData={setFormData}
                />

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-xl shadow-md active:bg-blue-700 items-center"
                    onPress={() => {
                        console.log(formData);
                        Alert.alert("Èxit", "Formulari enviat correctament! (Simulació)");
                        router.back();
                    }}
                >
                    <Text className="text-white font-bold text-lg">Enviar Formulari</Text>
                </TouchableOpacity>

            </ScrollView>

            <AssignmentModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              currentProjectSelection={currentProjectSelection}
              formData={formData}
              filteredStudents={filteredStudents}
              toggleProjectStudent={toggleProjectStudent}
            />

        </SafeAreaView>
    );
}
