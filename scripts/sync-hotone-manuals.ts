import { syncHotoneCatalog } from '../src/lib/hotone/sync';

async function main(): Promise<void> {
  const result = await syncHotoneCatalog();
  console.log(JSON.stringify(result));
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
