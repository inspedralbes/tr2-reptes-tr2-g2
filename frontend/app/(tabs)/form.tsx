import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Switch, Modal, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import alumneService, { Alumne } from '@/services/alumneService';
import tallerService, { Taller } from '@/services/tallerService';
import { Ionicons } from '@expo/vector-icons';

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

    // --- Sub-components (Render helpers) ---

    const renderCenterSelection = () => (
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 z-50">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Informació del Centre Educatiu</Text>

            <View className="mb-4 relative z-50">
                <Text className="text-gray-700 mb-2 font-medium">Selecciona el teu Centre</Text>
                <TouchableOpacity
                    onPress={() => setShowCenterDropdown(!showCenterDropdown)}
                    className="border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center"
                >
                    <Text className={formData.centerName ? "text-gray-900" : "text-gray-400"}>
                        {formData.centerName || "Tria un centre de la llista..."}
                    </Text>
                    <Ionicons name={showCenterDropdown ? "chevron-up" : "chevron-down"} size={20} color="gray" />
                </TouchableOpacity>
                {showCenterDropdown && (
                    <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-1 max-h-60">
                        <ScrollView nestedScrollEnabled className="max-h-60">
                            {centers.map(center => (
                                <TouchableOpacity
                                    key={center}
                                    className="p-3 border-b border-gray-100 active:bg-blue-50"
                                    onPress={() => {
                                        setFormData({ ...formData, centerName: center, selectedStudents: [] });
                                        setShowCenterDropdown(false);
                                    }}
                                >
                                    <Text className="text-gray-800">{center}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Nom complet del/la coordinador/a</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    placeholder="Nom i cognoms"
                    value={formData.coordinatorName}
                    onChangeText={(text) => setFormData({ ...formData, coordinatorName: text })}
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Email de contacte</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    placeholder="exemple@centre.cat"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.coordinatorEmail}
                    onChangeText={(text) => setFormData({ ...formData, coordinatorEmail: text })}
                />
            </View>

            <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-700 font-medium flex-1 pr-4">
                    És la primera vegada que participeu a la Modalitat C "Oficis compartits"?
                </Text>
                <Switch
                    value={formData.isFirstTime}
                    onValueChange={(val) => setFormData({ ...formData, isFirstTime: val })}
                    trackColor={{ false: "#767577", true: "#00426B" }}
                />
            </View>
        </View>
    );

    const renderStudentList = () => {
        if (!formData.centerName) return null;
        return (
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                <Text className="text-lg font-semibold text-gray-800 mb-4">Alumnes Participants</Text>
                {filteredStudents.length === 0 ? (
                    <Text className="text-gray-500 italic">No hi ha alumnes registrats per aquest centre.</Text>
                ) : (
                    <View className="max-h-60">
                        <ScrollView nestedScrollEnabled>
                            {filteredStudents.map(student => (
                                <TouchableOpacity
                                    key={student._id}
                                    onPress={() => toggleStudentSelection(student._id)}
                                    className={`flex-row items-center p-3 mb-2 rounded-lg border ${formData.selectedStudents.includes(student._id)
                                        ? "bg-blue-50 border-blue-500"
                                        : "bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <Ionicons
                                        name={formData.selectedStudents.includes(student._id) ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={formData.selectedStudents.includes(student._id) ? "#00426B" : "#9CA3AF"}
                                    />
                                    <View className="ml-3">
                                        <Text className="font-semibold text-gray-800">{student.nombre} {student.apellido}</Text>
                                        <Text className="text-xs text-gray-500">{student.email}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        );
    };

    const renderTermProjects = (term: '2nd' | '3rd', projects: Taller[]) => {
        const projectKey = term === '2nd' ? 'projects2ndTerm' : 'projects3rdTerm';
        const referentKey = term === '2nd' ? 'referentProjects2ndTerm' : 'referentProjects3rdTerm';
        const referentNameKey = term === '2nd' ? 'referentName2nd' : 'referentName3rd';
        const referentEmailKey = term === '2nd' ? 'referentEmail2nd' : 'referentEmail3rd';

        return (
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                <Text className="text-lg font-semibold text-gray-800 mb-4">{term === '2nd' ? "Reptes 2n Trimestre" : "Reptes 3r Trimestre"}</Text>

                {projects.map(project => {
                    const count = formData[projectKey][project.titol]?.count || '';
                    const assignedCount = formData[projectKey][project.titol]?.selectedStudents?.length || 0;
                    return (
                        <View key={project._id} className="mb-4 border-b border-gray-100 pb-4">
                            <Text className="font-bold text-gray-800 text-base mb-2">{project.titol}</Text>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-gray-600 w-32">Nombre d'alumnes:</Text>
                                <TextInput
                                    className="border border-gray-300 rounded p-2 w-20 text-center"
                                    keyboardType="numeric"
                                    value={count}
                                    onChangeText={val => updateProjectCount(term, project.titol, val)}
                                    placeholder="0"
                                />
                                <TouchableOpacity
                                    className="bg-blue-100 ml-4 p-2 rounded-lg"
                                    onPress={() => openStudentSelection(term, project.titol)}
                                >
                                    <Text className="text-blue-700 font-medium">Assignar ({assignedCount})</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Referent Selection Checkbox */}
                            <TouchableOpacity
                                className="flex-row items-center mt-1"
                                onPress={() => toggleReferentProject(term, project.titol)}
                            >
                                <Ionicons
                                    name={formData[referentKey].includes(project.titol) ? "checkbox" : "square-outline"}
                                    size={20}
                                    color="#4B5563"
                                />
                                <Text className="ml-2 text-gray-600 text-sm">Aquest projecte tindrà referent del centre</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

                <View className="mt-4 pt-4 border-t border-gray-200">
                    <Text className="text-gray-700 font-medium mb-2">Dades del Referent ({term === '2nd' ? '2n' : '3r'} Trimestre)</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-white mb-2"
                        placeholder="Nom del Professor/a Referent"
                        value={String(formData[referentNameKey])}
                        onChangeText={text => setFormData({ ...formData, [referentNameKey]: text })}
                    />
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-white"
                        placeholder="Email del Professor/a Referent"
                        value={String(formData[referentEmailKey])}
                        onChangeText={text => setFormData({ ...formData, [referentEmailKey]: text })}
                    />
                </View>
            </View>
        );
    };

    const renderAssignmentModal = () => {
        if (!currentProjectSelection) return null;
        const { term, project } = currentProjectSelection;
        const projectKey = term === '2nd' ? 'projects2ndTerm' : 'projects3rdTerm';
        const assignedIds = formData[projectKey][project]?.selectedStudents || [];

        return (
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-center p-4">
                    <View className="bg-white rounded-xl p-4 max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-4 border-b border-gray-200 pb-2">
                            <Text className="text-xl font-bold text-gray-800 flex-1">Assignar Alumnes</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2">
                                <Ionicons name="close" size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-600 mb-4 font-medium">Projecte: {project} ({term === '2nd' ? '2n' : '3r'} Trim.)</Text>

                        <FlatList
                            data={formData.selectedStudents.map(id => filteredStudents.find(s => s._id === id)).filter(Boolean) as Alumne[]}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => toggleProjectStudent(item._id)}
                                    className={`flex-row items-center p-3 mb-2 rounded-lg border ${assignedIds.includes(item._id)
                                        ? "bg-green-50 border-green-500"
                                        : "bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <Ionicons
                                        name={assignedIds.includes(item._id) ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={assignedIds.includes(item._id) ? "#16A34A" : "#9CA3AF"}
                                    />
                                    <Text className="ml-3 font-medium text-gray-800">{item.nombre} {item.apellido}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text className="text-gray-500 text-center py-4">No has seleccionat cap alumne a la llista general encara.</Text>}
                        />
                        <TouchableOpacity
                            className="bg-blue-600 p-3 rounded-xl mt-4 items-center"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white font-bold">Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

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

                {renderCenterSelection()}
                {renderStudentList()}
                {renderTermProjects('2nd', safeProjects2nd)}
                {renderTermProjects('3rd', safeProjects3rd)}

                <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Disponibilitat</Text>
                    <View className="flex-row gap-2 mt-2">
                        {["Dimarts", "Només Dijous"].map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                onPress={() => setFormData({ ...formData, availability: opt })}
                                className={`flex-1 p-3 rounded-lg border justify-center items-center ${formData.availability === opt
                                    ? "bg-blue-50 border-blue-600"
                                    : "bg-white border-gray-300"
                                    } `}
                            >
                                <Text className={formData.availability === opt ? "text-blue-700 font-bold" : "text-gray-600"}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Comentaris i Dubtes</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-white h-32"
                        multiline
                        textAlignVertical="top"
                        placeholder="Escriu aquí qualsevol informació addicional..."
                        value={formData.comments}
                        onChangeText={text => setFormData({ ...formData, comments: text })}
                    />
                </View>

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

            {renderAssignmentModal()}

        </SafeAreaView>
    );
}
