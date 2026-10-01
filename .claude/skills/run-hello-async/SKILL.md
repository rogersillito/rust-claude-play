---
name: run-hello-async
description: Build and test the hello-async concurrent URL fetcher
---

This is a Rust CLI application that fetches 1-4 URLs concurrently and returns the first one to complete, extracting its page title. The app demonstrates async/await patterns using the Tokio runtime.

## Prerequisites

- Rust toolchain (rustc, cargo) — installation: https://rustup.rs/
- Node.js/npm (for the test driver script)

## Build

```bash
cargo build
```

Release build:
```bash
cargo build --release
```

## Run (agent path)

Use the automated test driver:

```bash
node ./.claude/skills/run-hello-async/driver.mjs
```

This builds the project, then runs the following test cases:
- **Single URL**: `./target/debug/hello-async https://example.com`
- **Two URLs** (race): `./target/debug/hello-async https://example.com https://www.rust-lang.org`
- **Four URLs** (race): `./target/debug/hello-async https://example.com https://www.rust-lang.org https://github.com https://doc.rust-lang.org`
- **No URLs** (error validation): returns usage message
- **Too many URLs** (error validation with 5 args): returns usage message

The driver exits with code 0 if all tests pass, 1 otherwise.

## Run (direct invocation)

Execute the binary directly:

```bash
./target/debug/hello-async <url1> [url2] [url3] [url4]
```

Examples:
```bash
./target/debug/hello-async https://example.com
./target/debug/hello-async https://example.com https://www.rust-lang.org
./target/debug/hello-async https://example.com https://www.rust-lang.org https://github.com
./target/debug/hello-async https://example.com https://www.rust-lang.org https://github.com https://doc.rust-lang.org
```

**Output**: Prints which URL returned first and its page title (if available).

## Run (human path)

Same as direct invocation above. The app is a CLI tool with no GUI — invoke it directly with URLs as arguments.

## Test

Run the test driver which validates all code paths:

```bash
node ./.claude/skills/run-hello-async/driver.mjs
```

Or run the app directly with test URLs to see it in action.

## Gotchas

- **Network timeout**: The app uses real HTTP requests. Network latency may vary. Tests use `https://example.com` which is fast and reliable for testing.
- **Page title extraction**: Not all URLs have a `<title>` tag. The app handles missing titles gracefully ("It had no title.").
- **Concurrent behavior**: With 2+ URLs, the app uses Tokio's `select!` to race them. The winner is non-deterministic depending on network conditions. For reproducible tests, use `https://example.com` which is typically fastest.
- **Windows binary path**: On Windows, the compiled binary is `target\debug\hello-async.exe`. The driver script handles this automatically.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `cargo build` fails with "edition 2024 not recognized" | Update Rust: `rustup update`. Rust 1.85+ required for edition 2024. |
| Network timeout when fetching URLs | Check internet connection. Slow networks may timeout. Tests use fast endpoints. |
| `node: command not found` | Install Node.js from https://nodejs.org. The driver script requires Node for easy test orchestration. |
| Binary not found after build | Ensure `cargo build` completed successfully. Check for build errors in output. Binary is at `target/debug/hello-async` (or `.exe` on Windows). |
