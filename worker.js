export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // API Endpoints
    if (path.startsWith('/api/')) {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      // Register code from Roblox (updated to match your Roblox code)
      if (path === "/api/register-code" && request.method === "POST") {
        try {
          const { code } = await request.json();
          if (!code) {
            return new Response(JSON.stringify({ error: "No code provided" }), {
              status: 400,
              headers: corsHeaders
            });
          }
          await env.USER_CODES.put("current_code", code, { expirationTtl: 300 });
          return new Response(JSON.stringify({ status: "success", code }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: corsHeaders
          });
        }
      }

      // Get current code
      if (path === "/api/get-code" && request.method === "GET") {
        const code = await env.USER_CODES.get("current_code");
        return new Response(JSON.stringify({ code }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response("Not found", { status: 404 });
    }

    // Serve HTML Page (your original UI)
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Roblox Code Display</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0052cc, #3399ff);
            color: #fff;
            margin: 0;
            padding: 0;
            display: flex;
            height: 100vh;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
          h1 {
            font-weight: 700;
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-shadow: 0 2px 8px rgba(0,0,0,0.4);
          }
          #refreshBtn {
            background-color: #ffffff;
            color: #007acc;
            border: none;
            padding: 1rem 2rem;
            font-size: 1.2rem;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: background-color 0.3s ease, color 0.3s ease;
            margin-bottom: 2rem;
          }
          #refreshBtn:hover {
            background-color: #007acc;
            color: #ffffff;
            box-shadow: 0 6px 20px rgba(0,0,0,0.35);
          }
          #codeDisplay {
            margin-top: 1.5rem;
            font-size: 2.5rem;
            font-weight: 600;
            letter-spacing: 5px;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            background: rgba(255,255,255,0.15);
            padding: 1.5rem 3rem;
            border-radius: 12px;
            min-width: 300px;
            text-align: center;
            backdrop-filter: blur(5px);
          }
          #status {
            margin-top: 1rem;
            font-size: 1rem;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <h1>Current Verification Code</h1>
        <button id="refreshBtn">Refresh Code</button>
        <div id="codeDisplay">Loading...</div>
        <div id="status">Auto-refreshing every 10 seconds</div>

        <script>
          const btn = document.getElementById("refreshBtn");
          const codeDisplay = document.getElementById("codeDisplay");
          const statusEl = document.getElementById("status");

          let autoRefreshInterval;
          
          async function fetchCode() {
            try {
              statusEl.textContent = "Fetching code...";
              const res = await fetch("/api/get-code");
              const data = await res.json();
              
              if (data.code) {
                codeDisplay.textContent = data.code;
                statusEl.textContent = "Last updated: " + new Date().toLocaleTimeString();
              } else {
                codeDisplay.textContent = "No active code";
                statusEl.textContent = "No valid code found";
              }
            } catch (err) {
              console.error("Error:", err);
              codeDisplay.textContent = "Connection error";
              statusEl.textContent = "Failed to fetch code";
            }
          }

          function startAutoRefresh() {
            autoRefreshInterval = setInterval(fetchCode, 10000);
          }

          btn.onclick = async () => {
            btn.disabled = true;
            btn.innerText = "Refreshing...";
            await fetchCode();
            btn.disabled = false;
            btn.innerText = "Refresh Code";
          };

          // Initial load
          fetchCode();
          startAutoRefresh();
        </script>
      </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });
  }
};
