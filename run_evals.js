const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');
const execFilePromise = util.promisify(execFile);

const evalsDir = path.join(__dirname, 'docs', 'research', 'evals');
const runId = process.env.RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const timeoutMs = Number(process.env.TIMEOUT_MS || 300000);
const concurrency = Number(process.env.CONCURRENCY || 2);
const retries = Number(process.env.RETRIES || 1);
const resultsDir = process.env.RESULTS_DIR
  ? path.resolve(__dirname, process.env.RESULTS_DIR)
  : path.join(__dirname, 'eval_results', `run-${runId}`);

fs.mkdirSync(resultsDir, { recursive: true });

const files = fs.readdirSync(evalsDir).filter(f => f.endsWith('.md') && f !== 'README.md');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractTicketPaths(text) {
  const matches = (text || '').match(/docs\/research\/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md/g) || [];
  return [...new Set(matches)];
}

async function runGeminiWithRetry(prompt) {
  let lastError;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await execFilePromise('gemini', ['-y', '-p', prompt], {
        timeout: timeoutMs
      });
      return {
        ok: true,
        attempt,
        stdout: result.stdout || '',
        stderr: result.stderr || ''
      };
    } catch (err) {
      lastError = err;
      if (attempt <= retries) {
        await sleep(2000 * attempt);
      }
    }
  }

  return {
    ok: false,
    attempt: retries + 1,
    errorMessage: lastError && lastError.message ? lastError.message : 'Unknown error',
    stdout: lastError && lastError.stdout ? lastError.stdout : '',
    stderr: lastError && lastError.stderr ? lastError.stderr : ''
  };
}

async function runWithConcurrencyLimit(taskFactories, limit) {
  const results = [];
  const executing = new Set();
  for (const taskFactory of taskFactories) {
    const p = Promise.resolve().then(() => taskFactory());
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function runScenarios() {
  const taskFactories = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(evalsDir, file), 'utf8');
    const scenarios = content.split('## Scenario ').slice(1);
    
    let scenarioIndex = 1;
    for (const scenario of scenarios) {
      if (!scenario.includes('### Prompt')) continue;
      
      const promptPart = scenario.split('### Prompt')[1];
      const prompt = promptPart.split('---')[0].trim();
      
      const fileName = `${file.replace('.md', '')}_scenario_${scenarioIndex}.txt`;
      const outputPath = path.join(resultsDir, fileName);
      
      const taskFactory = async () => {
          console.log(`Running ${fileName}...`);
          const result = await runGeminiWithRetry(prompt);
          const tickets = extractTicketPaths(`${result.stdout}\n${result.stderr}`);
          const metadata = [
            'METADATA:',
            `run_id: ${runId}`,
            `timeout_ms: ${timeoutMs}`,
            `attempts: ${result.attempt}`,
            `status: ${result.ok ? 'success' : 'error'}`,
            `ticket_paths: ${tickets.length ? tickets.join(', ') : 'none'}`,
            ''
          ].join('\n');

          if (result.ok) {
            fs.writeFileSync(outputPath, `${metadata}\nSTDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}`);
          } else {
            fs.writeFileSync(
              outputPath,
              `${metadata}\nERROR:\n${result.errorMessage}\n\nSTDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}`
            );
          }
          console.log(`Finished ${fileName}`);
      };
      taskFactories.push(taskFactory);
      scenarioIndex++;
    }
  }
  console.log(`Starting ${taskFactories.length} scenarios with max concurrency ${concurrency}...`);
  console.log(`Results dir: ${resultsDir}`);
  await runWithConcurrencyLimit(taskFactories, concurrency);
  console.log('All scenarios finished.');
}

runScenarios().catch(console.error);
