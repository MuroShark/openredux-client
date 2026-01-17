import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Определяем __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Определяем пути
const projectRoot = path.resolve(__dirname, '../');
const patcherDir = path.resolve(projectRoot, '../patcher');
const clientBinDir = path.join(projectRoot, 'src-tauri', 'binaries');

// Определяем текущую платформу (target triple)
// Для Windows x64 это обычно x86_64-pc-windows-msvc
const targetTriple = 'x86_64-pc-windows-msvc'; 
const exeExt = process.platform === 'win32' ? '.exe' : '';
const dest = path.join(clientBinDir, `patcher-${targetTriple}${exeExt}`);

console.log('🏗️  Building Patcher...');

// 1. Сборка патчера (в релизном режиме для оптимизации)
if (!fs.existsSync(patcherDir)) {
    console.log('⚠️ Patcher source directory not found (CI environment?).');
    if (fs.existsSync(dest)) {
        console.log('✅ Binary already exists at destination. Skipping build.');
        process.exit(0);
    } else {
        console.error('❌ Patcher source missing AND binary missing. Build failed.');
        process.exit(1);
    }
}

try {
    execSync('cargo build --release', { cwd: patcherDir, stdio: 'inherit' });
} catch (e) {
    console.error('❌ Failed to build patcher');
    process.exit(1);
}

// 2. Создание папки binaries если нет
if (!fs.existsSync(clientBinDir)) {
    fs.mkdirSync(clientBinDir, { recursive: true });
}

// 3. Копирование и переименование
const source = path.join(patcherDir, 'target', 'release', `patcher${exeExt}`);

console.log(`📦 Copying binary to ${dest}`);
fs.copyFileSync(source, dest);
console.log('✅ Patcher updated successfully!');