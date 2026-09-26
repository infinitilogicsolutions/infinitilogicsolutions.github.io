---
id: 11
type: project
title: Infiniti Dictionary — A Browser-Native WordNet Experiment
slug: infiniti-dictionary-browser-native
date: 2026-09-25
summary: 147,478 searchable WordNet words in a 31.8 MB Parquet file, queried with DuckDB-Wasm in the browser with no application API or database server.
tags: [DuckDB, Parquet, Apache Arrow, WebAssembly, Local-First, GitHub Pages]
coverImage: assets/img/og/default.jpg
active: true
featured: true
---

## Goal

Test a simple architectural question: **how much of a read-heavy application can move into the browser before a traditional backend becomes unnecessary?**

Infiniti Dictionary uses Princeton WordNet 3.1 as a real dataset rather than a toy demo. The dictionary is packaged as one compressed Parquet file and queried by DuckDB-Wasm directly from the browser.

[Open Infiniti Dictionary](https://infinitilogicsolutions.github.io/dictionary/)

## The Dataset

The generated dictionary manifest contains:

- **147,478 unique lookup words**
- **207,235 word senses**
- **117,791 synsets**
- **31.8 MB** Parquet file
- Zstandard compression
- Princeton WordNet 3.1 source data

## Architecture

The application has no application API server and no database server in the lookup path.

On the first lookup, DuckDB-Wasm runs in the browser and reads the remotely hosted Parquet dataset:

```text
GitHub Pages / static hosting
          ↓
dictionary.parquet
          ↓
     DuckDB-Wasm
          ↓
   Apache Arrow
          ↓
         UI
```

After the first successful result, the application downloads the complete Parquet file, verifies its SHA-256 hash, and stores it in browser-managed local storage. Later searches can query that local file:

```text
Local Parquet → DuckDB-Wasm → Arrow → UI
```

## The Query

The lookup is ordinary SQL executed by DuckDB-Wasm inside the browser:

```sql
SELECT word,
       pos,
       sense_number,
       definition,
       examples,
       synonyms
FROM read_parquet('dictionary.parquet')
WHERE lookup_word = ?
ORDER BY pos, sense_number;
```

The implementation also checks inflections and simple normalized forms when an exact lookup does not return a result.

## Technologies and Tools Used

- Princeton WordNet 3.1
- Apache Parquet
- DuckDB-Wasm
- Apache Arrow
- WebAssembly
- Origin Private File System / browser storage
- Service Worker
- GitHub Pages
- Web Components

## Why It Is Interesting

A traditional implementation might introduce an API, application runtime, database, deployment pipeline, scaling configuration, and recurring hosting costs just to serve a mostly static dictionary.

This experiment takes a different route: keep the dataset compact, move the query engine to the client, and let static hosting deliver the application and data.

That does not make backends obsolete. It demonstrates that **some read-heavy, mostly static applications can have a much smaller server-side footprint than we often assume.**

## Result

The experiment works with the complete dataset while keeping the lookup architecture static-first and progressively local-first.

The most interesting result is not the dictionary itself. It is the architectural question it proves is worth asking:

**Before choosing a backend, should we first ask whether this application needs one?**

