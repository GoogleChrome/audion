/**
 * A nodejs script that copies files, writes a extension manifest, and zips it
 * all up.
 * @module makeChromeExtension
 */

const fs = require('fs').promises;
const {createWriteStream} = require('fs');
const path = require('path');

const mustache = require('mustache');
const {ZipFile} = require('yazl');

main();

/**
 * Copy files, generate extension manifest, and zip the unpacked extension.
 *
 * Calls other methods in this script.
 */
async function main() {
  await Promise.all([
    copyFiles({
      src: '..',
      dest: '../../build/audion',
      files: ['panel.html', 'devtools.html'],
    }),
    generateManifest({
      view: {version: require('../../package.json').version},
      dest: '../../build/audion',
    }),
  ]);
  await zipChromeExtension({
    src: '../../build',
    dir: 'audion',
  });
}

/**
 * Copy file paths from a src directory to a dest directory.
 * @param {object} options
 */
async function copyFiles({src, dest, files, cwd = __dirname}) {
  await Promise.all(
    files.map(async (file) => {
      await mkdir(path.resolve(cwd, dest, path.dirname(file)));
      await fs.copyFile(
        path.resolve(cwd, src, file),
        path.resolve(cwd, dest, file),
      );
    }),
  );
}

/**
 * Generate a extension manifest from a template file.
 * @param {object} options
 */
async function generateManifest({
  view,
  dest,
  file = 'manifest.json',
  cwd = __dirname,
}) {
  await mkdir(path.resolve(cwd, dest, path.dirname(file)));
  await fs.writeFile(
    path.resolve(cwd, dest, file),
    mustache.render(
      await fs.readFile(
        path.resolve(__dirname, 'manifest.json.mustache'),
        'utf8',
      ),
      view,
    ),
  );
}

/**
 * Zip the unpacked chrome extension.
 * @param {object} options
 */
async function zipChromeExtension({
  src,
  cwd = __dirname,
  dir,
  file = `${dir}.zip`,
}) {
  await unlink(path.resolve(cwd, src, file));
  const files = await readdirRecursive(path.resolve(cwd, src, dir));

  const output = createWriteStream(path.resolve(cwd, src, file));
  const zip = new ZipFile();
  const zipDone = new Promise((resolve, reject) =>
    zip.outputStream.pipe(output).on('close', resolve).on('error', reject),
  );
  for (const file of files) {
    zip.addFile(path.resolve(cwd, src, dir, file), file);
  }
  zip.end();

  await zipDone;
}

/**
 * Read entry names in a directory recursively.
 * @param {string} dir directory to recursively read
 * @return {Array<string>} array of paths relative to `dir`
 */
async function readdirRecursive(dir) {
  return (
    await Promise.all(
      (
        await fs.readdir(dir)
      ).map(async (file) => {
        try {
          return (await readdirRecursive(path.resolve(dir, file))).map(
            (subfile) => path.join(file, subfile),
          );
        } catch (err) {
          if (err.code === 'ENOTDIR') {
            return file;
          }
          throw err;
        }
      }),
    )
  ).flat();
}

/**
 * Create a directory if it does not already exist.
 * @param {string} dirpath directory to create
 */
async function mkdir(dirpath) {
  try {
    await fs.mkdir(dirpath, {recursive: true});
  } catch (err) {
    if (err.code === 'EEXIST') {
      return;
    }
    throw err;
  }
}

/**
 * Unlink a file from the filesystem if it exists.
 * @param {string} filepath file to unlink
 */
async function unlink(filepath) {
  try {
    await fs.unlink(filepath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return;
    }
    throw err;
  }
}
