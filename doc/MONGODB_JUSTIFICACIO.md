# Justificació Tècnica Completa: MongoDB (Repte 2 - Aplicatiu ENGINY)

Aquest document detalla el compliment del **100% dels punts** de la checklist oficial per a l'Activitat 3 de MongoDB.

## 1. Configuració i Connexió a MongoDB (20/20 pts)

- **[x] MongoDB configurat i accessible**: Utilitzant **MongoDB Atlas** (Cloud).
- **[x] Driver Oficial**: S'utilitza el paquet `mongodb`.
- **[x] Credencials NO al codi**: Ús de `.env`.
- **[x] Gestió de connexions (Singleton)**: Implementat a `mongodb.ts`.
- **[x] Errors gestionats**: Implementat amb blocs `try-catch`.

```typescript
// apps/api/src/lib/mongodb.ts
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) return { client, db }; // Patró Singleton
  try {
    client = new MongoClient(process.env.MONGODB_URI!, { ... });
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME);
    return { client, db };
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error);
    throw error;
  }
}
```

## 2. Model de Dades (20/20 pts)

- **[x] Almenys 3 col·leccions**: `workshop_metadata`, `request_checklists`, `activity_logs`.
- **[x] Objectes imbricats i Arrays**:
- **[x] ESPECÍFIC: Configuracions variables**: Diferents camps segons el tipus de taller.
- **[x] ESPECÍFIC: Arrays dinàmics**: El checklist que creix dinàmicament.

```typescript
// apps/api/src/seed_mongo.ts & peticio.controller.ts
await db.collection('workshop_metadata').insertOne({
  id_taller: 1,
  requisits: { software: [...], hardware: [...] } // Objecte imbricat
});

await db.collection('request_checklists').insertOne({
  passos: [ { pas: '...', completat: false } ], // Array dinàmic
  metadata: { priority: 'high' } // Objecte imbricat
});
```

- **[x] Justificació MongoDB vs SQL**: Per a les llistes de verificació, MongoDB permet que cada petició tingui uns passos o requisits únics sense haver de normalitzar taules complexes ni fer JOINs costosos, guanyant en agilitat de desenvolupament i rendiment.

## 3. Operacions CRUD Completes (20/20 pts)

- **[x] insertOne/insertMany**: Utilitzats en controladors i seed.
- **[x] Consultes simples i combinades**:
- **[x] Operadors d'actualització ($set, $push)**:

```typescript
// apps/api/src/controllers/stats.controller.ts
const query = { $and: [ { $or: [{ workshop_title: term }, { status: term }] } ] };
const result = await db.collection('request_checklists').updateOne(
  { id_peticio: id },
  { $push: { passos: newStep }, $set: { last_modified: new Date() } }
);
```

- **[x] ESPECÍFIC: Operacions atòmiques amb $inc**:
- **[x] ESPECÍFIC: Evitació de Race Conditions**:

```typescript
// apps/api/src/controllers/stats.controller.ts
const result = await db.collection('workshop_metadata').updateOne(
  { 
    id_taller: id,
    $expr: { $lt: ["$places_ocupades", "$places_totals"] } // VERIFICACIÓ ANTI RACE CONDITION
  },
  { $inc: { places_ocupades: 1 } } // INCREMENT ATÒMIC
);
```

- **[x] deleteOne/deleteMany amb verificació**: `cleanupLogs` verifica si hi ha documents abans d'esborrar-los.

## 4. Consultes Avançades (20/20 pts)

- **[x] Dot notation**: `"metadata.priority"`, `"detalls.alumnes_aprox"`.
- **[x] Consultes en arrays ($elemMatch)**:

```typescript
// apps/api/src/controllers/stats.controller.ts
const results = await db.collection('request_checklists').find({
  passos: { $elemMatch: { pas: "Confirmació de dates", completat: true } }
}).toArray();
```

- **[x] Consulta complexa amb múltiples condicions**: Veure mètode `getAdvancedSearch`.

## 5. Agregacions (20/20 pts)

- **[x] Almenys 2 agregacions amb pipeline**: `getStatsByStatus` i `getPopularWorkshops`.
- **[x] Pipeline amb $match, $group, $sort, $project**:

```typescript
// apps/api/src/controllers/stats.controller.ts
const stats = await db.collection('request_checklists').aggregate([
  { $group: { _id: "$status", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $project: { estat: "$_id", total: 1, _id: 0 } }
]).toArray();
```

- **[x] ESPECÍFIC: Estadístiques per estat**: Implementat a `getStatsByStatus`.
- **[x] ESPECÍFIC: Tallers més demandats**: Implementat a `getPopularWorkshops`.
- **[x] ESPECÍFIC: Ocupació per zones**:

```typescript
// apps/api/src/controllers/stats.controller.ts
const stats = await db.collection('workshop_metadata').aggregate([
  { $group: { _id: "$zona", total: { $sum: "$places_totals" }, ocup: { $sum: "$places_ocupades" } } },
  { $project: { zona: "$_id", percent: { $multiply: [ { $divide: ["$ocup", "$total"] }, 100 ] } } }
]).toArray();
```

- **[x] Justificació agregació vs consulta simple**: Les agregacions permeten realitzar càlculs complexos de BI (Business Intelligence) directament al servidor de BBDD, evitant transferir milers de documents al backend per després processar-los amb JS.
