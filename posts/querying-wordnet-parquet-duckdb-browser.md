---
id: 12
type: blog
title: I Put 147,478 Words in a Parquet File and Queried It From the Browser
slug: querying-wordnet-parquet-duckdb-browser
date: 2026-09-25
summary: How I built a $0-backend dictionary using Princeton WordNet, Parquet, Apache Arrow, DuckDB-Wasm, browser storage, and GitHub Pages.
tags: [DuckDB, Parquet, Apache Arrow, WebAssembly, Software Architecture, Local-First]
coverImage: assets/img/og/default.jpg
active: true
---

Do you know you can **query a file hosted on GitHub almost like a database — directly from the browser?**

I wanted to find out whether that idea was useful beyond a small proof of concept.

So I used the **Princeton WordNet 3.1** dataset and built Infiniti Dictionary around it.

The resulting Parquet dataset contains **147,478 unique lookup words, 207,235 word senses, and 117,791 synsets** in a **31.8 MB** compressed file.

And the application does not need an application API server or database server to search it.

[Try Infiniti Dictionary](https://infinitilogicsolutions.github.io/dictionary/)

## The Question

When we start a web application, architecture conversations often begin with questions such as:

- Which database should we use?
- Where should the API run?
- Do we need containers?
- Should this be serverless?
- How should the backend scale?

For this experiment I started one step earlier:

**Do I need a backend for this workload at all?**

A dictionary is an interesting test. It is read-heavy, the source data changes infrequently, and the lookup pattern is predictable. That makes it a good candidate for moving more responsibility into the browser.

## One File Instead of a Database Server

I transformed the WordNet data into a single Parquet file.

Why Parquet rather than shipping a giant JSON document?

Parquet gives the application a compact, typed, columnar dataset that a query engine can understand directly. Instead of writing JavaScript to download and deserialize an entire JSON structure before searching it, I can let DuckDB query the dataset.

The file is Zstandard-compressed and is about **31.8 MB**.

## Put DuckDB in the Browser

The next part is what makes the experiment interesting.

**DuckDB-Wasm runs the database query engine inside the browser.**

The lookup itself is SQL:

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

There is no request from my UI to a custom dictionary API. The browser runs DuckDB-Wasm and DuckDB reads the Parquet data.

The query result is represented through the Arrow-based data path used by DuckDB-Wasm and then rendered by the UI.

## The First Search Is Remote

There is an important detail in the architecture.

The application does **not** force someone to download the entire dictionary before seeing the first result.

On the first lookup, the browser registers the remote Parquet file with DuckDB-Wasm and searches the online dataset.

Conceptually:

```text
GitHub-hosted Parquet
        ↓
   DuckDB-Wasm
        ↓
  Apache Arrow
        ↓
       UI
```

That gives the user a result before the application turns itself into a local-first dictionary.

## Then the Dictionary Moves Local

After that first result, the application begins downloading the complete Parquet file in the background.

Before using the local copy, it checks the expected file size and verifies the file using its **SHA-256 hash**.

Once verified, the browser can register that local file with DuckDB-Wasm.

The next lookup becomes:

```text
Local Parquet → DuckDB-Wasm → Arrow → UI
```

At that point the dictionary data no longer needs a network round trip for each search.

The service worker also caches application assets so the experiment can support offline reload behavior after the necessary resources have been cached.

## What "$0 Backend" Means

I describe this as a **$0-backend experiment**, not "zero infrastructure."

There is still infrastructure: GitHub serves the static application and dataset, and the user's device provides compute and storage.

What the design removes from this application is the backend infrastructure I would otherwise operate:

- No application API server
- No database server
- No Lambda functions for lookups
- No containers for the dictionary service
- No database connection pool
- No backend autoscaling problem for searches

Within the hosting limits of the services being used, there is no dedicated backend bill for the dictionary lookup architecture.

That distinction matters.

## Why Apache Arrow Is Part of the Story

Parquet is the storage format. DuckDB is the query engine.

Apache Arrow provides the efficient columnar representation used in the query-result path. That combination is particularly interesting because these technologies were once associated mostly with data engineering and analytical systems.

WebAssembly makes it practical to bring that capability into a browser application.

The stack becomes:

**Static hosting + Parquet + DuckDB-Wasm + Arrow + browser storage.**

## What This Does Not Mean

This experiment does not prove that every application should eliminate its backend.

Applications with transactional writes, centralized authorization, secrets, cross-user consistency, server-controlled business rules, or frequently changing private data still have strong reasons for server-side architecture.

The lesson is narrower — and more useful:

**Do not add a backend simply because web applications traditionally have one.**

Start with the workload.

For a public, read-heavy, relatively static dataset, client-side analytical technology can change the architecture significantly.

## The Dictionary Is the Proof

The part I find most interesting is not that I built another dictionary.

It is that a browser can work with a real Princeton WordNet dataset containing **207,235 word senses** from a single **31.8 MB Parquet file**, execute SQL over it with DuckDB-Wasm, and progressively move the dataset onto the user's device.

That changes the question I want to ask at the beginning of similar projects.

Not:

**"Which backend should I build?"**

But:

**"Does this workload need a backend in the first place?"**

[Explore Infiniti Dictionary](https://infinitilogicsolutions.github.io/dictionary/)
