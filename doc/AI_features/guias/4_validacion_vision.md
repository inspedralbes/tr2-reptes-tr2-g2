# Guía de Implementación: Validación Automática de Documentos

Esta guía describe los pasos técnicos para integrar la **Validación Automática de Documentos** mediante Visión por Computador (Simulada).

## Workflow Simplificado (Visión por Computador)
El sistema actúa como un "filtro previo" inteligente antes de que el documento llegue al profesor:
1.  **Subida (Upload)**: El alumno sube su "Acuerdo Pedagógico" (PDF).
2.  **Escaneo Visual**: El sistema "mira" el documento (en milisegundos).
3.  **Detección de Objetos**: Busca patrones gráficos específicos:
    *   **Estructura**: ¿Tiene el formato de una hoja oficial? (Headers/Footers).
    *   **Firma**: Busca trazos manuscritos en la zona inferior derecha ("Signature Box").
4.  **Decisión**:
    *   ✅ **Válido**: Si detecta la firma, guarda el archivo.
    *   ❌ **Inválido**: Si está vacío o sin firmar, lo rechaza inmediatamente y le dice al alumno: *"Falta la firma en la página 3"*.

---

## 1. Crear Servicio de Visión (Backend)

**Archivo**: `apps/api/src/services/vision.service.ts`

Implementar la lógica de validación de archivos.
-   **Entrada**: Archivo subido (Buffer/Multer File).
-   **Salida**: Objeto `ValidationResult` con `valid: boolean` y lista de errores.
-   **Lógica (Mock)**:
    -   Validar formato (extensión PDF).
    -   Validar tamaño mínimo (>1KB).
    -   **Simulación de Firma**: Rechazar si el nombre del archivo contiene "error" o "unsigned". En un entorno real, esto se sustituiría por una llamada a AWS Textract o una librería OCR.

```typescript
export class VisionService {
  async validateDocument(file: File) {
     // ... check extension ...
     // ... check size ...
     // ... check signature pattern ...
     return { valid: true, metadata: { hasSignature: true } };
  }
}
```

## 2. Integrar en el Controlador

**Archivo**: `apps/api/src/controllers/assignacio.controller.ts`

Añadir el método `validateDocumentUpload`.
-   Recibe el archivo vía `req.file`.
-   Invoca `VisionService`.
-   Si es inválido -> Retorna **400 Bad Request** con los detalles del error.
-   Si es válido -> Retorna **200 OK**.

## 3. Configurar Endpoint y Middleware

**Archivo**: `apps/api/src/routes/assignacio.routes.ts`

1.  Importar `multer` para gestionar la subida de archivos (almacenamiento en memoria para análisis rápido).
2.  Definir la ruta POST:
```typescript
const upload = multer({ storage: multer.memoryStorage() });
router.post('/upload/validate', authenticateToken, upload.single('file'), assignacioController.validateDocumentUpload);
```

---

## Preguntas Frecuentes

### 1. ¿Cómo valida la firma realmente?
En este prototipo usamos una **simulación**.
*   **Prototipo**: Mira si el archivo se llama "unsigned.pdf" o si está vacío (<1KB).
*   **Producción**: Usaría servicios como **AWS Textract** o **Google Document AI**. Estos servicios devuelven coordenadas: *"Veo una firma manuscrita en la posición X:100, Y:500 con un 98% de confianza"*.

### 2. ¿Compara la firma con el DNI?
**No**. La IA de visión solo detecta *"si hay algo escrito que parece una firma"*.
*   No verifica la identidade (caligrafía).
*   Solo asegura que el alumno no suba un PDF en blanco o el documento equivocado.
*   Esto elimina el 90% de los errores tontos (subir la plantilla vacía por error), ahorrando horas de revisión manual a los tutores.

### 3. ¿Qué pasa si subo una foto (.jpg) en vez de un PDF?
El sistema lo rechazará automáticamente ("Invalid file format"). La IA está entrenada (o programada en este caso) para esperar la estructura de un documento PDF oficial.
