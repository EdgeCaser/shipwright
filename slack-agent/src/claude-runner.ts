import { spawn } from 'child_process';
import { config } from './config.js';

export interface ClaudeResult {
  reply: string;
  sessionId: string;
}

export function runClaude(prompt: string, sessionId?: string): Promise<ClaudeResult> {
  return new Promise((resolve, reject) => {
    const args = [
      '-p', prompt,
      '--output-format', 'json',
      '--max-turns', '5',
    ];

    if (sessionId) {
      args.push('--resume', sessionId);
    }

    console.log(`[claude] spawning${sessionId ? ` (resume ${sessionId.slice(0, 8)}...)` : ' (new session)'}`)

    const child = spawn(config.claudePath, args, {
      cwd: config.projectCwd,
      timeout: config.claudeTimeoutMs,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        if (stderr) console.error('[claude stderr]', stderr);
        return reject(new Error(`claude exited with code ${code}`));
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve({
          reply: parsed.result ?? stdout.trim(),
          sessionId: parsed.session_id ?? '',
        });
      } catch {
        // Fallback if JSON parsing fails
        resolve({ reply: stdout.trim(), sessionId: '' });
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}
