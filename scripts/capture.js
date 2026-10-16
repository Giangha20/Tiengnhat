const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\Users\\giang\\AppData\\Local\\Temp\\edge_cdp_profile_' + Date.now();
const outputDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function rpc(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const onMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', onMessage);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function waitForServer(port) {
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:' + port, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 500) resolve();
          else reject(new Error('Status ' + res.statusCode));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      console.log('Next.js server is UP on port', port);
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 600));
    }
  }
  throw new Error('Next.js server timed out');
}

(async () => {
  console.log('Starting Next.js production server on port 3006...');
  const nextServer = spawn('cmd.exe', ['/c', 'npx', 'next', 'start', '-p', '3006'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore'
  });

  let edgeProcess = null;

  try {
    await waitForServer(3006);

    console.log('Launching Edge with Chrome DevTools Protocol...');
    edgeProcess = spawn(edgePath, [
      '--headless=new',
      '--remote-debugging-port=9444',
      `--user-data-dir=${userDataDir}`,
      '--disable-gpu',
      '--no-first-run',
      'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 1500));

    const targetsRes = await fetch('http://127.0.0.1:9444/json');
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    console.log('Connecting to Page WebSocket:', pageTarget.webSocketDebuggerUrl);

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener('open', resolve));

    await rpc(ws, 'Page.enable');
    await rpc(ws, 'DOM.enable');
    await rpc(ws, 'Runtime.enable');

    const screenshotTargets = [
      { name: 'pc_home.png', url: 'http://localhost:3006/', width: 1280, height: 900, mobile: false },
      { name: 'mobile_home.png', url: 'http://localhost:3006/', width: 390, height: 844, mobile: true },
      { name: 'pc_bai_tap.png', url: 'http://localhost:3006/bai-tap', width: 1280, height: 900, mobile: false },
      { name: 'mobile_bai_tap.png', url: 'http://localhost:3006/bai-tap', width: 390, height: 844, mobile: true },
      { name: 'pc_luyen_go.png', url: 'http://localhost:3006/luyen-go', width: 1280, height: 900, mobile: false },
      { name: 'mobile_luyen_go.png', url: 'http://localhost:3006/luyen-go', width: 390, height: 844, mobile: true },
      { name: 'pc_tu_vung.png', url: 'http://localhost:3006/tu-vung', width: 1280, height: 900, mobile: false },
      { name: 'pc_cai_dat.png', url: 'http://localhost:3006/cai-dat', width: 1280, height: 900, mobile: false }
    ];

    for (const item of screenshotTargets) {
      console.log(`Capturing ${item.name} (${item.width}x${item.height}, mobile: ${item.mobile})...`);
      
      await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
        width: item.width,
        height: item.height,
        deviceScaleFactor: item.mobile ? 2 : 1,
        mobile: item.mobile,
        screenWidth: item.width,
        screenHeight: item.height
      });

      if (item.mobile) {
        await rpc(ws, 'Emulation.setUserAgentOverride', {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        });
      } else {
        await rpc(ws, 'Emulation.setUserAgentOverride', {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
        });
      }

      await rpc(ws, 'Page.navigate', { url: item.url });
      await new Promise(r => setTimeout(r, 1600));

      const shotRes = await rpc(ws, 'Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false
      });

      const outPath = path.join(outputDir, item.name);
      fs.writeFileSync(outPath, Buffer.from(shotRes.data, 'base64'));
      console.log(`✓ Saved: ${item.name} (${Math.round(shotRes.data.length * 0.75 / 1024)} KB)`);
    }

    ws.close();
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    console.log('Cleaning up processes...');
    if (edgeProcess) {
      try { edgeProcess.kill(); } catch (e) {}
    }
    if (nextServer) {
      try { nextServer.kill(); } catch (e) {}
    }
    try {
      execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq *next*"', { stdio: 'ignore' });
    } catch (e) {}
  }
})();
