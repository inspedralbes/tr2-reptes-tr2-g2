'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import assignacioService, { Assignacio } from '@/services/assignacioService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import Pagination from "@/components/Pagination";

export default function DocumentVerificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [assignacions, setAssignacions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignacio, setSelectedAssignacio] = useState<any | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    documentName: '',
    comment: '',
    greeting: 'Hola bona tarda'
  });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await assignacioService.getAll();
      // Filter for those that have documents or are in a state that suggests they might (e.g., DATA_SUBMITTED)
      // For now, let's show all and let the admin filter or just see who has what.
      setAssignacions(data);
    } catch (err) {
      console.error(err);
      toast.error('No s\'han pogut carregar les assignacions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotification = (assignacio: any, docName: string) => {
    setSelectedAssignacio(assignacio);
    setNotificationData({
      ...notificationData,
      documentName: docName,
      comment: ''
    });
    setShowNotificationModal(true);
  };

  const sendNotification = async () => {
    if (!selectedAssignacio) return;
    if (!notificationData.comment.trim()) {
      toast.error('Has d\'escriure un comentari');
      return;
    }

    setSendingNotif(true);
    try {
      await assignacioService.sendDocumentNotification(
        selectedAssignacio.id_assignacio,
        notificationData.documentName,
        notificationData.comment,
        notificationData.greeting
      );
      toast.success('Notificació enviada correctament');
      setShowNotificationModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Error en enviar la notificació');
    } finally {
      setSendingNotif(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Hola bon dia';
    if (hour < 20) return 'Hola bona tarda';
    return 'Hola bona nit';
  };

  useEffect(() => {
    setNotificationData(prev => ({ ...prev, greeting: getGreeting() }));
  }, []);

  const handleValidateDocument = async (idInscripcio: number, field: string, valid: boolean) => {
    try {
      await assignacioService.validateDocument(idInscripcio, field, valid);
      toast.success(valid ? 'Document validat' : 'Validació treta');
      loadData(); // Refresh list to see updated status
    } catch (err) {
      console.error(err);
      toast.error('Error al validar el document');
    }
  };

  const totalPages = Math.ceil(assignacions.length / itemsPerPage);
  const paginatedAssignacions = assignacions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  if (authLoading || !user) {
    return <Loading fullScreen message="Verificant permisos d'administrador..." />;
  }

  return (
    <DashboardLayout
      title="Verificació de Documents"
      subtitle="Corrobora la documentació dels centres i notifica possibles errors"
    >
      <div className="space-y-6">
        {/* List of Assignments */}
        <div className="bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">Centre / Taller</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">Documentació Alumnat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Loading message="Carregant assignacions..." />
                  </td>
                </tr>
              ) : assignacions.length > 0 ? (
                paginatedAssignacions.map((assig) => (
                  <tr key={assig.id_assignacio} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 text-sm">{assig.centre?.nom}</div>
                      <div className="text-[10px] font-bold text-[#4197CB] uppercase tracking-tight">{assig.taller?.titol}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">
                      {assig.data_inici && assig.data_fi ? (
                        <div className="flex flex-col">
                          <span>Inici: {new Date(assig.data_inici).toLocaleDateString()}</span>
                          <span>Fi: {new Date(assig.data_fi).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Dates no definides</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {assig.inscripcions?.map((ins: any) => (
                          <div key={ins.id_inscripcio} className="flex items-center justify-between gap-4 p-3 border border-gray-100 bg-gray-50/50 group">
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="text-xs font-bold text-gray-700 truncate">
                                {ins.alumne?.nom} {ins.alumne?.cognoms}
                              </div>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    { id: 'acord_pedagogic', name: 'Acord Pedagògic', url: ins.url_acord_pedagogic, valid: ins.validat_acord_pedagogic, validField: 'validat_acord_pedagogic' },
                                    { id: 'autoritzacio_mobilitat', name: 'Aut. Mobilitat', url: ins.url_autoritzacio_mobilitat, valid: ins.validat_autoritzacio_mobilitat, validField: 'validat_autoritzacio_mobilitat' },
                                    { id: 'drets_imatge', name: 'Drets d\'Imatge', url: ins.url_drets_imatge, valid: ins.validat_drets_imatge, validField: 'validat_drets_imatge' }
                                  ].map(doc => (
                                    <div key={doc.id} className="flex items-center gap-1">
                                      {doc.url ? (
                                        <div className="flex items-center">
                                          <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-[9px] font-bold px-3 py-1.5 uppercase transition-all flex items-center gap-1.5 border ${
                                                doc.valid 
                                                  ? 'border-green-200 text-green-600 hover:bg-green-50' 
                                                  : 'border-[#4197CB]/30 text-[#00426B] hover:bg-blue-50'
                                            }`}
                                            title={`Veure ${doc.name}`}
                                          >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {doc.name}
                                          </a>
                                            {!doc.valid ? (
                                                <button 
                                                  onClick={() => handleValidateDocument(ins.id_inscripcio, doc.validField, true)}
                                                  className="bg-green-50 text-green-600 px-3 py-1.5 text-[9px] font-black uppercase hover:bg-green-100 transition-all border border-green-200 border-l-0"
                                                  title="Acceptar document"
                                                >
                                                    Acceptar
                                                </button>
                                            ) : (
                                              <button 
                                                  onClick={() => handleValidateDocument(ins.id_inscripcio, doc.validField, false)}
                                                  className="bg-red-50 text-red-500 px-3 py-1.5 text-[9px] font-black uppercase hover:bg-red-100 transition-all border border-red-200 border-l-0"
                                                  title="Revocar validació"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                      ) : (
                                        <span className="text-[9px] font-bold text-gray-300 border border-gray-100 px-2 py-1 uppercase" title={`${doc.name} pendent`}>
                                          Pendent {doc.name}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                            <button
                              onClick={() => handleOpenNotification(assig, 'Selecciona document')}
                              className="text-[9px] font-bold border border-red-200 text-red-500 px-3 py-1.5 uppercase hover:bg-red-50 transition-all flex items-center gap-1.5 shrink-0"
                              title="Notificar un problema amb la documentació d'aquest alumne"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Enviar problema
                            </button>
                          </div>
                        ))}
                        {(!assig.inscripcions || assig.inscripcions.length === 0) && (
                          <span className="text-[10px] italic text-gray-400">Sense alumnes inscrits</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase">
                    No hi ha assignacions per mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={assignacions.length}
          currentItemsCount={paginatedAssignacions.length}
          itemName="assignacions"
        />
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-black text-[#00426B] uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Notificar Problema
              </h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-blue-50 border-l-4 border-[#4197CB] p-4 text-blue-700">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1">Previsualització del missatge</p>
                <div className="text-xs italic leading-relaxed">
                  "{notificationData.greeting}, el document <span className="font-bold underline">{notificationData.documentName === 'Selecciona document' ? '[Document]' : notificationData.documentName}</span> del taller <span className="font-bold">{selectedAssignacio?.taller?.titol}</span> està malament {notificationData.comment}"
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Salutació</label>
                    <select
                      value={notificationData.greeting}
                      onChange={(e) => setNotificationData({ ...notificationData, greeting: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                    >
                      <option value="Hola bon dia">Hola bon dia</option>
                      <option value="Hola bona tarda">Hola bona tarda</option>
                      <option value="Hola bona nit">Hola bona nit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Document amb error</label>
                    <select
                      value={notificationData.documentName}
                      onChange={(e) => setNotificationData({ ...notificationData, documentName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                    >
                      <option value="Selecciona document" disabled>Selecciona document...</option>
                      <option value="Acord Pedagògic">Acord Pedagògic</option>
                      <option value="Autorització de Mobilitat">Autorització de Mobilitat</option>
                      <option value="Drets d'Imatge">Drets d'Imatge</option>
                      <option value="Tota la documentació">Tota la documentació</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Comentari (Motiu de l'error)</label>
                  <textarea
                    value={notificationData.comment}
                    onChange={(e) => setNotificationData({ ...notificationData, comment: e.target.value })}
                    placeholder="Escriu aquí el motiu de l'error..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={sendNotification}
                  disabled={sendingNotif || notificationData.documentName === 'Selecciona document'}
                  className={`flex-[2] py-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    sendingNotif || notificationData.documentName === 'Selecciona document' ? 'bg-gray-100 text-gray-400' : 'bg-[#00426B] text-white hover:bg-[#0775AB] shadow-md'
                  }`}
                >
                  {sendingNotif ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-white/20 border-t-white"></div>
                      <span>Enviant...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Enviar Notificació</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
