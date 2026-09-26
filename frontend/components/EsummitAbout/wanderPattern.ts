// Wander pattern definition from tabbied (drunkard's path block)
// Extracted to avoid loading the full 635KB generated catalog and prevent subpath resolution issues

export const wander = {
  name: 'Wander',
  slug: 'wander',
  galleryOrder: 45,
  description:
    "The drunkard's path quilt block: quarter-moons wandering over solid ground, joining into snakes and loops.",
  palette: ['#FFFFFF', '#3E8BFF', '#1B4075', '#3EECFF'],
  colors: {
    min: 2,
    max: 4,
    default: 4,
  },
  options: [
    {
      id: 'grid',
      displayName: 'Columns and rows',
      type: 'ButtonSelectGroup',
      default: '8x12',
      options: ['2x3', '4x6', '6x9', '8x12', '10x15'],
      replace: '${grid}',
    },
    {
      id: 'frequency',
      displayName: 'Frequency',
      type: 'Slider',
      default: 1,
      min: 0.2,
      max: 1,
      step: 0.1,
      replace: '${shapeFrequency}',
    },
  ],
  code: {
    style:
      "/* The quarter-disc picks one of the two accent blues */ --randomColor: @p(var(--color2), var(--color2), var(--color3)); --rule: ( /*Frequency options of 0.2, 0.4, 0.6, 0.8, 1.0 */ /* Solid ground with a corner-anchored quarter disc; the corner is chosen by rotating the cell so neighboring discs join into winding paths */ @random(${shapeFrequency}) { background: var(--color1); -webkit-transform: rotate(@pick(0deg, 90deg, 180deg, 270deg)); transform: rotate(@pick(0deg, 90deg, 180deg, 270deg)); :after { content: ''; position: absolute; left: 0; top: 0; @size: 100%; background: var(--randomColor); -webkit-clip-path: circle(100% at 0 0); clip-path: circle(100% at 0 0); -webkit-transition: ease 400ms; transition: ease 400ms; } } -webkit-transition: ease 400ms; transition: ease 400ms; );",
    doodle:
      ':doodle { @grid: ${grid}; @size: ${width} ${height}; overflow:hidden; text-align:center; box-sizing:border-box } :container { background: var(--color0); overflow:hidden; }',
  },
} as const
