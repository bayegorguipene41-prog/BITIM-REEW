# Come aggiungere un nuovo paese — CONVENZIONE

Questa guida descrive come aggiungere un paese alle procedure **senza modificare
alcun componente** (wizard, esplora, ricerca, risultati). Tutto è guidato dai dati
e dai file di procedura.

## Flusso dei dati

```
lib/db/procedures/<Paese>.ts        ← dati (UNA convenzione, schema Procedure)
        │
        ▼
lib/db/procedures/index.ts          ← export costante + elenco (1 riga)
        │
        ▼
lib/db/procedures/lookup.ts         ← getProcedureById / proceduresForCountry
        │
        ▼
Wizard / Esplora / Ricerca / API    ← nessuna modifica qui
```

## Passi

1. **Aggiungi il Paese a `lib/db/countries.ts`** (solo se non esiste): un elemento
   `{ code: "ISO", it, en, flag }`. Il `code` ISO è l'identificativo usato da
   `countryCode`.

2. **Crea `lib/db/procedures/<Paese>.ts`** che esporta una o più costanti di tipo
   `Procedure`, seguendo ESATTAMENTE `lib/types.ts`:
   - `id`: unico e stabile (`"<ISO>-<slug-procedura>"`).
   - `countryCode`: **codice ISO maiuscolo** (es. `"IT"`, `"FR"`). **Non il nome
     italiano del Paese**.
   - `slug`: kebab-case (es. `"permesso-soggiorno-lavoro"`).
   - `title` / `description`: `LocalizedText`. `it`/`en` sono obbligatori; le
     altre 5 lingue dell'interfaccia (`fr`, `es`, `de`, `pt`, `ar`) sono
     **opzionali per campo**. `localize()` / `resolveLocalized()` risolvono in
     fallback: lingua richiesta → altre lingue disponibili → `en` → `it`. Non
     inventare contenuti ufficiali: se non hai testo reale per una lingua,
     ometti la chiave e lascia che il fallback la restituisca.
   - `category`: una delle categorie canoniche.
   - `sources[].lastVerifiedAt`: `"YYYY-MM-DD"` reale. Fonte con data vecchia (>12
     mesi) viene mostrata con badge "da verificare".
   - `requirements[]`: `DocumentRequirement`, ognuno con `id`, `code`, `name`,
     `necessity`, `sourceId`.

3. **Registra in `lib/db/procedures/index.ts`**:
   - importa la costante;
   - aggiungila all'array `PROCEDURES` (l'ordine definisce `PROCEDURES[0]` ma NON
     determina la procedura scelta dall'utente: la selezione avviene sempre per
     `id` via `proceduresForCountry` / `getProcedureById`).

Null'altro è necessario: esplora, ricerca, wizard e risultati leggono
automaticamente `PROCEDURES`.

## Regole d'oro

- **Mai** campi specifici di un Paese in `lib/types.ts`. Lo schema è unico e
  generico; le differenze nazionali vanno nei valori, non nei tipi.
- **Mai** decidere la procedura dell'utente con `PROCEDURES[0]` o `applicable[0]`
  nel flusso richiesto: sempre per `id`.
- **Mai** inventare dati ufficiali. Ogni trattamento richiede una fonte reale con
  `lastVerifiedAt`; se non disponibile, lasciare `requirements` vuoti e la UI
  mostrerà lo stato "non abbiamo ancora informazioni".
- Contenuti placeholder copiati da un altro Paese (es. testo "in Italia") sono da
  correggere nel file di quel Paese, mai propagare.