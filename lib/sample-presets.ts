import type { SynthPresetSchema } from "./synth-preset-schema"

// Sample preset data that matches our current Minimoog layout
export const minimoogViolinPreset: SynthPresetSchema = {
  id: "minimoog-violin-lead",
  deviceName: "Minimoog Model D",
  presetName: "70s Violin Lead",
  author: "SEQ1",
  created: "2025-04-14",
  tags: ["lead", "strings", "vintage"],
  highlightColor: "#ff7f50",

  sections: [
    {
      id: "controllers",
      title: "CONTROLLERS",
      layout: { columns: 1, width: 1 },
      animationDelay: 300,
      controls: [
        {
          id: "tune",
          type: "knob",
          name: "TUNE",
          value: 64,
          min: 0,
          max: 127,
          animationDelay: 400,
        },
        {
          id: "glide",
          type: "knob",
          name: "GLIDE",
          value: 0,
          min: 0,
          max: 127,
          animationDelay: 450,
        },
        {
          id: "mod-mix",
          type: "knob",
          name: "MOD MIX",
          value: 89,
          min: 0,
          max: 127,
          fillColor: "#ff7f50",
          animationDelay: 500,
        },
        {
          id: "osc-mod",
          type: "switch",
          name: "OSC MOD",
          value: "On",
          options: ["On", "Off"],
          fillColor: "#ff7f50",
          animationDelay: 550,
        },
        {
          id: "filter-mod",
          type: "switch",
          name: "FILTER MOD",
          value: "Off",
          options: ["On", "Off"],
          animationDelay: 600,
        },
      ],
    },
    {
      id: "oscillator-bank",
      title: "OSCILLATOR BANK",
      layout: { columns: 2, width: 1 },
      animationDelay: 400,
      controls: [
        {
          id: "range",
          type: "knob",
          name: "RANGE",
          value: 32,
          min: 2,
          max: 32,
          displayType: "range",
          animationDelay: 450,
        },
        {
          id: "osc1-freq",
          type: "knob",
          name: "OSC1 FREQ",
          value: 64,
          min: 0,
          max: 127,
          displayType: "frequency",
          animationDelay: 500,
        },
        {
          id: "osc2-freq",
          type: "knob",
          name: "OSC2 FREQ",
          value: 64,
          min: 0,
          max: 127,
          displayType: "frequency",
          animationDelay: 550,
        },
        {
          id: "waveform1",
          type: "knob",
          name: "WAVEFORM",
          value: 51,
          min: 0,
          max: 127,
          displayType: "waveform",
          animationDelay: 600,
        },
        {
          id: "osc3-freq",
          type: "knob",
          name: "OSC3 FREQ",
          value: 64,
          min: 0,
          max: 127,
          displayType: "frequency",
          animationDelay: 650,
        },
        {
          id: "waveform2",
          type: "knob",
          name: "WAVEFORM",
          value: 76,
          min: 0,
          max: 127,
          displayType: "waveform",
          animationDelay: 700,
        },
      ],
    },
    {
      id: "mixer",
      title: "MIXER",
      layout: { columns: 1, width: 1 },
      animationDelay: 500,
      controls: [
        {
          id: "volume",
          type: "knob",
          name: "VOLUME",
          value: 102,
          min: 0,
          max: 127,
          fillColor: "#8badc0",
          animationDelay: 550,
        },
        {
          id: "osc1",
          type: "switch",
          name: "OSC1",
          value: "On",
          options: ["On", "Off"],
          fillColor: "#8badc0",
          animationDelay: 600,
        },
        {
          id: "osc2",
          type: "switch",
          name: "OSC2",
          value: "On",
          options: ["On", "Off"],
          fillColor: "#8badc0",
          animationDelay: 600,
        },
        {
          id: "noise",
          type: "knob",
          name: "NOISE",
          value: 0,
          min: 0,
          max: 127,
          animationDelay: 650,
        },
        {
          id: "noise-type",
          type: "switch",
          name: "NOISE TYPE",
          value: "White",
          options: ["White", "Pink"],
          orientation: "vertical",
          animationDelay: 700,
        },
      ],
    },
    {
      id: "modifiers",
      title: "MODIFIERS",
      layout: { columns: 3, width: 1 },
      animationDelay: 600,
      controls: [
        {
          id: "cutoff",
          type: "knob",
          name: "CUTOFF",
          value: 89,
          min: 0,
          max: 127,
          fillColor: "#ff7f50",
          animationDelay: 650,
          // Add modulation to the cutoff knob
          modulation: {
            active: true,
            minValue: 40,
            maxValue: 90,
            speed: "medium",
          },
        },
        {
          id: "resonance",
          type: "knob",
          name: "RESONANCE",
          value: 51,
          min: 0,
          max: 127,
          fillColor: "#ff7f50",
          animationDelay: 675,
        },
        {
          id: "contour",
          type: "knob",
          name: "CONTOUR",
          value: 76,
          min: 0,
          max: 127,
          fillColor: "#ff7f50",
          animationDelay: 700,
        },
        {
          id: "filter-section-label",
          type: "label",
          name: "FILTER CONTOUR",
          text: "FILTER CONTOUR",
          textSize: "xs",
          isBold: true,
          isUppercase: true,
          animationDelay: 710,
        },
        {
          id: "filter-attack",
          type: "knob",
          name: "ATTACK",
          value: 0,
          min: 0,
          max: 127,
          animationDelay: 725,
        },
        {
          id: "filter-decay",
          type: "knob",
          name: "DECAY",
          value: 64,
          min: 0,
          max: 127,
          animationDelay: 750,
        },
        {
          id: "filter-sustain",
          type: "knob",
          name: "SUSTAIN",
          value: 76,
          min: 0,
          max: 127,
          animationDelay: 775,
        },
        {
          id: "loudness-section-label",
          type: "label",
          name: "LOUDNESS CONTOUR",
          text: "LOUDNESS CONTOUR",
          textSize: "xs",
          isBold: true,
          isUppercase: true,
          animationDelay: 785,
        },
        {
          id: "loudness-attack",
          type: "knob",
          name: "ATTACK",
          value: 0,
          min: 0,
          max: 127,
          animationDelay: 800,
        },
        {
          id: "loudness-decay",
          type: "knob",
          name: "DECAY",
          value: 51,
          min: 0,
          max: 127,
          animationDelay: 825,
        },
        {
          id: "loudness-sustain",
          type: "knob",
          name: "SUSTAIN",
          value: 89,
          min: 0,
          max: 127,
          fillColor: "#ff7f50",
          animationDelay: 850,
          // Add modulation to the sustain knob
          modulation: {
            active: true,
            minValue: 70,
            maxValue: 110,
            speed: "slow",
          },
        },
      ],
    },
    {
      id: "output",
      title: "OUTPUT",
      layout: { columns: 1, width: 1 },
      animationDelay: 700,
      controls: [
        {
          id: "output-volume",
          type: "knob",
          name: "VOLUME",
          value: 102,
          min: 0,
          max: 127,
          animationDelay: 750,
        },
        {
          id: "main-out",
          type: "switch",
          name: "MAIN OUT",
          value: "On",
          options: ["On", "Off"],
          fillColor: "#8badc0",
          animationDelay: 800,
        },
      ],
    },
  ],
  notes:
    "Use Oscillator-3 Frequency knob to adjust modulation rate. Try sweeping the CUTOFF and SUSTAIN knobs for expressive timbral changes.",
}

// Add more preset examples as needed
export const minimoogBassPreset: SynthPresetSchema = {
  id: "minimoog-acid-bass",
  deviceName: "Minimoog Model D",
  presetName: "Acid Bass",
  author: "SEQ1",
  created: "2025-04-14",
  tags: ["bass", "acid", "303"],
  highlightColor: "#4287f5",

  // Sections and controls would go here, similar to the violin preset
  sections: [
    // Similar structure to the violin preset but with different values
    // ...
  ],
  notes: "Classic acid bass sound. Adjust cutoff and resonance for squelchy effects.",
}
