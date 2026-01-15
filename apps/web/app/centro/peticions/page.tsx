'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME, CALENDARI } from '@enginy/shared';

export default function PeticionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tallers, setTallers] = useState<any[]>([]);
  const [selectedTallers, setSelectedTallers] = useState<number[]>([]);
  const [alumnes, setAlumnes] = useState<number>(0);
  const [comentaris, setComentaris] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.rol.nom_rol !== 'COORDINADOR') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Fetch talleres disponibles
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tallers`)
      .then(res => res.json())
      .then(setTallers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTallers.length === 0) return alert('Selecciona al menos un taller');

    try {
      for (const id_taller of selectedTallers) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peticions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_centre: user?.id_centre,
            id_taller,
            alumnes_aprox: alumnes,
            comentaris
          })
        });
      }
      setSuccess(true);
      setTimeout(() => router.push('/centro'), 2000);
    } catch (error) {
      alert('Error al enviar solicitud');
    }
  };

  const toggleTaller = (id: number) => {
    setSelectedTallers(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: THEME.colors.background }}>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/centro')}
          className="mb-6 text-sm flex items-center gap-2 hover:underline"
          style={{ color: THEME.colors.primary }}
        >
          ← Volver al panel
        </button>

        <h2 className="text-3xl font-bold mb-2">Solicitar Talleres Enginy</h2>
        <p className="text-gray-600 mb-8">
          Selecciona tus preferencias para el próximo curso. Fecha límite: <strong>{new Date(CALENDARI.LIMITE_DEMANDA).toLocaleDateString()}</strong>
        </p>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            ¡Solicitud enviada correctamente! Redireccionando...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-4">Talleres Preferidos (selecciona varios)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-64 overflow-y-auto p-2 border rounded">
                {tallers.map(t => (
                  <div 
                    key={t.id_taller}
                    onClick={() => toggleTaller(t.id_taller)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedTallers.includes(t.id_taller) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <h4 className="font-bold text-sm">{t.titol}</h4>
                    <p className="text-xs text-gray-500">{t.sector?.nom}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Número aproximado de alumnos</label>
                <input 
                  type="number"
                  value={alumnes}
                  onChange={(e) => setAlumnes(parseInt(e.target.value))}
                  required
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">Comentarios adicionales</label>
              <textarea 
                value={comentaris}
                onChange={(e) => setComentaris(e.target.value)}
                className="w-full p-2 border rounded h-24"
                placeholder="Horarios preferidos, necesidades especiales..."
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 rounded-lg text-white font-bold transition shadow-lg"
              style={{ backgroundColor: THEME.colors.primary }}
            >
              Enviar Demanda
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
