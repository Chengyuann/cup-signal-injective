import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { matchPlayers } from '../dist-data/players-export.mjs';

const generator = '/Users/bytedance/.codex/skills/aidp-gpt-image-2/scripts/gpt_image_2.py';
const outDir = 'public/players/generated';
mkdirSync(outDir, { recursive: true });

const palette = {
  ARG: 'sky blue and warm white kit colors with small gold trim, no logos, no crests',
  ENG: 'warm white kit colors with crisp red and muted navy trim, no logos, no crests',
  MEX: 'deep green kit colors with warm white and muted red trim, no logos, no crests',
};
const rolePose = {
  GK: 'goalkeeper stance with oversized gloves, alert eyes, one knee bent, ready to dive',
  CB: 'defender stance, strong shoulders, one arm pointing, guarding space',
  DM: 'defensive midfielder stance, one foot on ball, scanning the field',
  CM: 'midfielder engine pose, running with small data trails around the boots',
  AM: 'playmaker pose, left foot close to the ball, calm tactical expression',
  W: 'winger sprint pose, body angled forward with dynamic speed ribbons',
  ST: 'striker pose, leaning toward goal with sharp finishing focus',
};

for (const player of matchPlayers) {
  const basename = `${player.id}-${player.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-chibi`;
  const path = join(outDir, `${basename}.png`);
  if (existsSync(path)) {
    console.log(JSON.stringify({ skipped: player.id, path }));
    continue;
  }
  const prompt = [
    'Original fictional chibi football player avatar, not a real person portrait, not photorealistic.',
    `Inspired by a ${player.role} role and jersey number ${player.number}, but with a unique invented face and hairstyle.`,
    palette[player.team],
    rolePose[player.role],
    `Personality details: ${player.traits.join(', ')}.`,
    'Glossy collectible sticker style, expressive anime small-body proportions, clean light background, subtle football data accents.',
    'No text, no watermark, no official federation badge, no club badge, no sponsor mark, no realistic celebrity likeness.'
  ].join(' ');
  const result = spawnSync('python3', [generator, 'generate', '--prompt', prompt, '--size', '1024x1024', '--quality', 'medium', '--output-dir', outDir, '--output-name', basename, '--retries', '4', '--retry-backoff', '10'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.status !== 0) {
    console.error(JSON.stringify({ failed: player.id, status: result.status }));
  }
}
