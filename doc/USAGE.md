# 📖 Guia d'Ús - Iter

Aquesta guia explica com treballar amb l'ecosistema de desenvolupament en el dia a dia.

## 🚀 Començar a Treballar

Cada vegada que vulguis iniciar la teva jornada de desenvolupament:

1.  **Aixecar el sistema**:
    ```bash
    docker compose up
    ```
    *Espera que el servei `setup` acabi (Exit 0) per començar a fer peticions a l'API o entrar a la Web.*

2.  **Aturar el sistema**:
    *   Premeu `Ctrl+C` a la terminal on corre Docker.
    *   O des d'una altra terminal: `docker compose stop`.

## 🗄️ Treballant amb la Base de Dades (Prisma)

Si necessites modificar el model de dades:

1.  Edita `apps/api/prisma/schema.prisma`.
2.  Des de la terminal de l'host (fora de Docker), pots fer:
    ```bash
    # Per aplicar canvis sense fer una migració formal (desenvolupament ràpid)
    docker compose exec -w /app/apps/api api npx prisma db push

    # Per regenerar els tipus del client
    docker compose exec -w /app/apps/api api npx prisma generate
    ```
3.  **Visualitzar les dades**: Entra a [http://localhost:8080](http://localhost:8080) amb les credencials:
    *   Server: `db`
    *   User: `postgres`
    *   Pass: `root`
    *   DB: `iter_db`

## 🛠️ Comandos Útils de Manteniment

| Acció | Comanda | Descripció |
| :--- | :--- | :--- |
| **Neteja Profunda** | `docker compose down -v` | Esborra contenidors i VOLUMS (BBDD inclosa). |
| **Reinstal·lar tot** | `docker compose up --build` | Reconstrueix imatges i força la instal·lació de `npm`. |
| **Logs en viu** | `docker compose logs -f [servei]` | Mostra els logs d'un servei específic (api, web o db). |
| **Entrar al contenidor** | `docker compose exec [servei] sh` | Per executar comandos interns de depuració. |

## 📱 Desenvolupament Mobile (Expo)

L'aplicació mòbil no corre dins de Docker per facilitar la connexió amb el teu mòbil real.

1.  Assegura't de tenir Docker aixecat (especialment l'API).
2.  Ves a la carpeta del mòbil: `cd apps/mobile`.
3.  Instal·la dependències (la primera vegada): `npm install`.
4.  Llança Expo: `npx expo start`.
5.  Escaneja el codi QR amb l'app **Expo Go** (Android) o la teva càmera (iOS).

> [!TIP]
> Si no pots connectar amb l'API des del mòbil, revisa que el fitxer `apps/mobile/.env` tingui la teva IP local real (ex: `192.168.1.XX`) i no `localhost`.

## ✨ Funcionalitats Intel·ligents

L'aplicació incorpora funcionalitats avançades potenciades per IA que es poden provar des del panell d'administració o l'App mòbil:

*   **Motor d'Assignació Automàtica**: Generació optimitzada de grups de tallers.
*   **Assistent de Veu**: Avaluació docent mitjançant dictat natural (accessible des de la fitxa d'alumne a l'App).
*   **Predicció de Risc**: Anàlisi automàtica de patrons d'assistència i notes.
*   **Validació Documental**: Verificació d'Acords Pedagògics al pujar PDFs.

Per a detalls d'implementació i guies específiques, consulta la [Documentació Completa d'IA](./AI_features/DOCUMENTACION_IA_COMPLETA.md).

## 🔍 Solució de Problemes Freqüents

*   **L'API diu "Database not ready"**: Espera uns segons més, PostgreSQL triga una mica a acceptar connexions després del primer arrencament.
*   **Error "Module not found"**: Això sol passar si has parat l'arrencada a la meitat. Fes un `docker compose down -v` i torna a començar.
*   **La Web no refresca els canvis**: Verifica que no tinguis un error de sintaxi al codi que hagi aturat el procés de Next.js.
