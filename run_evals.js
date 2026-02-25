const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');
const execFilePromise = util.promisify(execFile);

const evalsDir = path.join(__dirname, 'docs', 'research', 'evals');
const resultsDir = path.join(__dirname, 'eval_results');

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

const files = fs.readdirSync(evalsDir).filter(f => f.endsWith('.md') && f !== 'README.md');

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
          try {
            const { stdout, stderr } = await execFilePromise('gemini', ['-y', '-p', prompt], {
              timeout: 120000 // 120s timeout
            });
            fs.writeFileSync(outputPath, `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`);
          } catch (err) {
            fs.writeFileSync(outputPath, `ERROR:\n${err.message}\n\nSTDOUT:\n${err.stdout}\n\nSTDERR:\n${err.stderr}`);
          }
          console.log(`Finished ${fileName}`);
      };
      taskFactories.push(taskFactory);
      scenarioIndex++;
    }
  }
  console.log(`Starting ${taskFactories.length} scenarios with max concurrency 2...`);
  await runWithConcurrencyLimit(taskFactories, 2);
  console.log("All scenarios finished.");
}

runScenarios().catch(console.error);