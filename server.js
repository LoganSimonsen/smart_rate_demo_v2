const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return cb(null, true);
      }
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);

app.use(express.static(__dirname));

app.get("/status", (req, res) => {
  res.json({ status: "Server is online" });
});

const authKey = process.env.EP_PRODUCTION_KEY || process.env.EP_TEST_KEY;
if (!authKey) {
  console.warn("Missing EasyPost API key env var");
}

app.use("/shipments", (req, res, next) => {
  if (!authKey) {
    return res.status(500).json({
      error:
        "Missing EasyPost API key. Set EP_PRODUCTION_KEY or EP_TEST_KEY in the server environment.",
    });
  }
  return next();
});

app.use(
  "/shipments",
  createProxyMiddleware({
    target: "https://api.easypost.com/v2",
    changeOrigin: true,
    logLevel: "info",
    onProxyReq(proxyReq) {
      proxyReq.setHeader(
        "Authorization",
        `Basic ${Buffer.from(`${authKey}:`).toString("base64")}`,
      );
    },
    onProxyRes(proxyRes, req) {
      if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
        console.error(
          `EasyPost upstream error for ${req.method} ${req.originalUrl}: ${proxyRes.statusCode}`,
        );
      }
    },
    onError(err, req, res) {
      console.error(`Proxy error for ${req.method} ${req.originalUrl}`, err);
      if (!res.headersSent) {
        res.status(502).json({
          error: "Failed to reach EasyPost from the proxy server.",
          detail: err.message,
        });
      }
    },
  }),
);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
