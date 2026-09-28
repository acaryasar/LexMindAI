/**
 * Prisma 5.22 CLI'nin `db push` / `migrate` komutlari, driver adapter
 * (@prisma/adapter-libsql) kullanan bir "sqlite" datasource'u dogrudan
 * libsql://... URL'i ile KABUL ETMIYOR (CLI, adapter'dan bihaber; url'in
 * "file:" ile baslamasini zorunlu kiliyor - bkz. Prisma+Turso bilinen
 * sinirlama). Bu script bu sinirlamayi asar:
 *   1) Aynı schema'yi gecici bir LOKAL sqlite dosyasina push eder
 *      (CLI bunu "file:" URL'i oldugu icin sorunsuz kabul eder).
 *   2) O lokal dosyadan olusan tum CREATE TABLE / CREATE INDEX ifadelerini
 *      okur ve libsql client ile doğrudan Turso'ya uygular.
 * Idempotenttir: bir tablo/index zaten varsa o ifadeyi atlar, digerlerine
 * devam eder. (Not: mevcut bir tabloya yeni KOLON eklemek icin bu script
 * yeterli degildir - boyle bir degisiklik gerektiginde manuel ALTER TABLE
 * gerekir; bu script sadece eksik tablo/index'leri tamamlar.)
 */
const { createClient } = require('@libsql/client');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendDir = path.join(__dirname, '..');
const schemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const shadowFile = path.join(backendDir, 'prisma', '_shadow.db');

for (const suffix of ['', '-journal', '-wal', '-shm']) {
  const f = shadowFile + suffix;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

console.log('[push-schema-to-turso] Lokal golge (shadow) sqlite dosyasina schema push ediliyor...');
execSync(
  `npx prisma db push --schema="${schemaPath}" --skip-generate --accept-data-loss`,
  {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: `file:${shadowFile}` },
    stdio: 'inherit',
  },
);

async function main() {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('libsql:')) {
    throw new Error(
      'DATABASE_URL bir libsql:// adresi olmali (Turso). Su an: ' + process.env.DATABASE_URL,
    );
  }

  const shadow = createClient({ url: `file:${shadowFile}` });
  const remote = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const { rows } = await shadow.execute(
    "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND type IN ('table','index') AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY (type = 'index')",
  );

  console.log(`[push-schema-to-turso] Turso'ya ${rows.length} tablo/index ifadesi uygulanacak...`);
  let applied = 0;
  let skipped = 0;
  for (const row of rows) {
    try {
      await remote.execute(String(row.sql));
      applied++;
    } catch (err) {
      const msg = (err && err.message) || String(err);
      if (/already exists/i.test(msg)) {
        skipped++;
      } else {
        console.error(`[push-schema-to-turso] HATA (${row.type} ${row.name}): ${msg}`);
        throw err;
      }
    }
  }
  console.log(`[push-schema-to-turso] Tamamlandi. Uygulanan: ${applied}, zaten mevcut (atlandi): ${skipped}`);

  shadow.close();
  remote.close();

  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const f = shadowFile + suffix;
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}

main().catch((err) => {
  console.error('[push-schema-to-turso] Basarisiz:', err);
  process.exit(1);
});
