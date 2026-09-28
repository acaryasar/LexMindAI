/**
 * Prisma 5.22 CLI'nin `db push` / `migrate` komutlari, driver adapter
 * (@prisma/adapter-libsql) kullanan bir "sqlite" datasource'u dogrudan
 * libsql://... URL'i ile KABUL ETMIYOR (CLI, adapter'dan bihaber; url'in
 * "file:" ile baslamasini zorunlu kiliyor - bkz. Prisma+Turso bilinen
 * sinirlama). Bu script bu sinirlamayi asar:
 *   1) Aynı schema'yi gecici bir LOKAL sqlite dosyasina push eder
 *      (CLI bunu "file:" URL'i oldugu icin sorunsuz kabul eder). Bu dosya
 *      OS temp dizininde olusturulur (OneDrive gibi senkron edilen proje
 *      klasorlerinde dosya kilitlenmesi sorunlarindan kacinmak icin).
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
const os = require('os');

const backendDir = path.join(__dirname, '..');

// Bu script duz `node` ile calistigi icin (prisma CLI/@prisma/client'in
// kendi otomatik .env yuklemesi burada devreye girmiyor), DATABASE_URL /
// TURSO_AUTH_TOKEN'i apps/backend/.env dosyasindan kendimiz yukluyoruz.
try {
  require('dotenv').config({ path: path.join(backendDir, '.env') });
} catch (err) {
  console.warn('[push-schema-to-turso] "dotenv" paketi yuklenemedi, ortam degiskenlerinin zaten set edilmis olmasi gerekiyor.');
}
const schemaPath = path.join(backendDir, 'prisma', 'schema.prisma');

// Windows'ta "file:" URL'i icinde ters slash sorun yaratabildigi ve OneDrive
// gibi senkron edilen klasorlerde hizli create/delete kilitlenmelere yol
// acabildigi icin gecici dosyayi OS temp dizininde, duz slash'li bir URL ile
// olusturuyoruz.
const shadowFile = path.join(os.tmpdir(), `iyiavukat-prisma-shadow-${process.pid}.db`);
const shadowUrl = `file:${shadowFile.split(path.sep).join('/')}`;

function cleanupShadowFiles() {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const f = shadowFile + suffix;
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch (err) {
      console.warn(`[push-schema-to-turso] Gecici dosya silinemedi (${f}): ${(err && err.message) || err}`);
    }
  }
}

cleanupShadowFiles();

console.log(`[push-schema-to-turso] Lokal golge (shadow) sqlite dosyasina schema push ediliyor... (${shadowFile})`);
try {
  execSync(
    `npx prisma db push --schema="${schemaPath}" --skip-generate --accept-data-loss`,
    {
      cwd: backendDir,
      env: { ...process.env, DATABASE_URL: shadowUrl },
      stdio: 'inherit',
    },
  );
} catch (err) {
  console.error('[push-schema-to-turso] Lokal shadow db\'ye "prisma db push" basarisiz oldu. Yukaridaki Prisma ciktisina bakin.');
  cleanupShadowFiles();
  process.exit(1);
}

async function main() {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('libsql:')) {
    throw new Error(
      'DATABASE_URL bir libsql:// adresi olmali (Turso). Su an: ' + process.env.DATABASE_URL,
    );
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN tanimli degil (.env / .env.development kontrol edin).');
  }

  const shadow = createClient({ url: shadowUrl });
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
  cleanupShadowFiles();
}

main().catch((err) => {
  console.error('[push-schema-to-turso] Basarisiz:', err);
  cleanupShadowFiles();
  process.exit(1);
});
