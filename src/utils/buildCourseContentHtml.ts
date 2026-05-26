import type { CourseWebViewPayload } from "../types/webViewTypes";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJsonForScript(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

function renderNativeHeadersSection(
  headers: Record<string, string>
): string {
  const rows = Object.entries(headers)
    .map(
      ([key, value]) =>
        `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `
  <div class="card">
    <h2 style="font-size:1.1rem;margin-bottom:10px;">Native context (request headers)</h2>
    <p class="meta" style="margin-bottom:12px;">
      Values below are sent from the React Native WebView on the initial document request.
    </p>
    <table class="headers-table" id="native-headers-table">
      <thead>
        <tr><th>Header</th><th>Value</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

export function buildCourseContentHtml(
  payload: CourseWebViewPayload,
  nativeHeaders: Record<string, string>
): string {
  const title = escapeHtml(payload.title);
  const instructor = escapeHtml(payload.instructor);
  const description = escapeHtml(payload.description);
  const category = escapeHtml(payload.category);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(payload.progressPercent))
  );
  const enrollmentStatus = escapeHtml(payload.enrollmentStatus);
  const headersJson = escapeJsonForScript(JSON.stringify(nativeHeaders));
  const nativeHeadersSection = renderNativeHeadersSection(nativeHeaders);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 20px;
      line-height: 1.5;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
    }
    h1 { font-size: 1.5rem; margin-bottom: 8px; }
    .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 4px; }
    .badge {
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: capitalize;
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 12px;
    }
    .progress-wrap { margin: 16px 0; }
    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }
    .progress-bar {
      height: 10px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #2563eb, #3b82f6);
      border-radius: 999px;
      width: ${progressPercent}%;
    }
    .status {
      font-weight: 700;
      color: ${enrollmentStatus === "Enrolled" ? "#16a34a" : "#64748b"};
    }
    p.description { color: #475569; white-space: pre-wrap; }
    .headers-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .headers-table th,
    .headers-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    .headers-table th {
      background: #f1f5f9;
      color: #334155;
      width: 42%;
      font-weight: 700;
    }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
    button {
      flex: 1;
      min-width: 140px;
      border: none;
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-complete { background: #2563eb; color: #fff; }
    .btn-feedback { background: #0f172a; color: #fff; }
    #feedback-input {
      width: 100%;
      margin-top: 12px;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.95rem;
    }
    @media (orientation: landscape) {
      body { padding: 24px 32px; max-width: 720px; margin: 0 auto; }
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">${category}</span>
    <h1>${title}</h1>
    <p class="meta"><strong>Instructor:</strong> ${instructor}</p>
    <p class="meta"><strong>Enrollment:</strong> <span class="status">${enrollmentStatus}</span></p>
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Progress</span>
        <span>${progressPercent}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill"></div></div>
    </div>
  </div>
  ${nativeHeadersSection}
  <div class="card">
    <h2 style="font-size:1.1rem;margin-bottom:10px;">Description</h2>
    <p class="description">${description}</p>
  </div>
  <div class="card">
    <h2 style="font-size:1.1rem;margin-bottom:12px;">Actions</h2>
    <div class="actions">
      <button class="btn-complete" type="button" id="complete-btn">Mark Lesson Complete</button>
      <button class="btn-feedback" type="button" id="feedback-btn">Send Feedback</button>
    </div>
    <input id="feedback-input" type="text" placeholder="Share your feedback..." />
  </div>
  <script id="native-headers-data" type="application/json">${headersJson}</script>
  <script>
    (function () {
      var dataEl = document.getElementById("native-headers-data");
      if (dataEl) {
        try {
          window.__NATIVE_HEADERS__ = JSON.parse(dataEl.textContent || "{}");
        } catch (e) {
          window.__NATIVE_HEADERS__ = {};
        }
      }
    })();
    function postToNative(payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }
    document.getElementById("complete-btn").addEventListener("click", function () {
      postToNative({ type: "COMPLETE_LESSON" });
    });
    document.getElementById("feedback-btn").addEventListener("click", function () {
      var value = document.getElementById("feedback-input").value.trim() || "Great course";
      postToNative({ type: "FEEDBACK", value: value });
    });
  </script>
</body>
</html>`;
}
