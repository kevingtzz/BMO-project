import rawContract from './faceContract.json';
import type { EyeExpression } from '../components/BmoEyes/BmoEyes';
import type { MouthMode } from '../components/BmoMouth/BmoMouth';

export interface FixedPreset {
  kind: 'fixed';
  eyes: EyeExpression;
  mouth: MouthMode;
}

export interface KeepPreviousPreset {
  kind: 'keep_previous';
  fallback: {
    eyes: EyeExpression;
    mouth: MouthMode;
  };
}

export type FacePresetDefinition = FixedPreset | KeepPreviousPreset;

interface FaceContractSchema {
  version: string;
  aliases: Record<string, string>;
  presets: Record<string, FacePresetDefinition>;
}

const contract = rawContract as FaceContractSchema;

export const FACE_CONTRACT_VERSION = contract.version;
export const FACE_PRESET_ALIASES = contract.aliases;
export const FACE_PRESETS = contract.presets;
