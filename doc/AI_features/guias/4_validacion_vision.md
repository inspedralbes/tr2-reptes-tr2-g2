# Guía de Implementación: Validación Automática de Documentos

Esta guía describe los pasos técnicos para integrar la **Validación Automática de Documentos** mediante Visión por Computador (Simulada).

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

1.  Importar `multer` para gestionar la subida de archivos.
2.  Definir la ruta POST:
```typescript
const upload = multer({ storage: multer.memoryStorage() });
router.post('/upload/validate', authenticateToken, upload.single('file'), assignacioController.validateDocumentUpload);
```

## 4. Uso y Prueba

**Petición**:
-   `POST /api/assignacions/upload/validate`
-   **Body (form-data)**: Key `file` = (Subir un PDF).

**Comportamiento Esperado**:
-   Si subes `documento.pdf` -> ✅ Éxito.
-   Si subes `error_document.pdf` (sin firma) -> ❌ Error 400: "Signature not detected".
