import "./server.js";

// Start worker ONLY when enabled (free-tier workaround)
if (process.env.ENABLE_WORKER === "true") {
  console.log("[Main] ENABLE_WORKER=true, starting worker...");
  import("./worker/index.js");
} else {
  console.log("[Main] Worker disabled");
}
