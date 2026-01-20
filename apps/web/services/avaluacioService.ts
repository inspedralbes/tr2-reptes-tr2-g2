import getApi from './api';

const api = getApi();

export const avaluacioService = {
    getAvaluacioInscripcio: (id_inscripcio: number) =>
        api.get(`/evaluacions/inscripcio/${id_inscripcio}`),

    upsetAvaluacio: (data: any) =>
        api.post('/evaluacions/upset', data),

    getCompetencies: () =>
        api.get('/evaluacions/competencies'),

    getModels: () =>
        api.get('/questionaris/models'),

    analyzeObservations: (text: string) =>
        api.post('/evaluacions/analyze', { text }),

    submitAutoconsulta: (data: any) =>
        api.post('/questionaris/autoconsulta', data),

    getReports: () =>
        api.get('/questionaris/reports'),
};
