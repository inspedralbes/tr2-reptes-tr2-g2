
export class ChatService {
    processMessage(message: string): string {
        const lowerInput = message.toLowerCase();

        if (lowerInput.includes('hola') || lowerInput.includes('bon dia') || lowerInput.includes('bona tarda')) {
            return "Hola! Com puc ajudar-te a gestionar el centre avui?";
        }

        if (lowerInput.includes('on') || lowerInput.includes('anar') || lowerInput.includes('ruta')) {
            return "Per navegar, utilitza el menú principal o les targetes de l'escriptori. Si busques una secció específica, digues-m'ho.";
        }

        if (lowerInput.includes('alumne') || lowerInput.includes('estudiant')) {
            return "Pots gestionar els alumnes des de la secció 'Gestió Alumnat'. Vols que t'hi porti?";
        }

        if (lowerInput.includes('taller') || lowerInput.includes('activitat')) {
            return "Els tallers es gestionen des de la secció 'Solicitar Tallers' o 'Assignacions' depenent de la fase.";
        }

        if (lowerInput.includes('professor') || lowerInput.includes('docent')) {
            return "Pots afegir i gestionar els professors des de la secció 'Gestió Professors'.";
        }

        if (lowerInput.includes('assignaci') || lowerInput.includes('plaça')) {
            return "Les assignacions es poden consultar a la secció 'Assignacions' un cop finalitzat el període de sol·licitud.";
        }

        return "Ho sento, no t'he entès. Pots reformular la pregunta? Puc ajudar-te amb alumnes, professors, tallers o navegació.";
    }
}
