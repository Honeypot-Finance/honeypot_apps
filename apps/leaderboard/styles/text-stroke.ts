const createStrokeWidthStyles = (width: string) => ({
  '-webkit-text-stroke-width': width,
  'text-stroke-width': width,
  'stroke-width': width,
});

const createStrokeColorStyles = (color: string) => ({
  '-webkit-text-stroke-color': color,
  'text-stroke-color': color,
  stroke: color,
});

export const textStrokePlugin = ({ matchUtilities }: any) => {
  matchUtilities(
    {
      'text-stroke': (value: string) => createStrokeWidthStyles(value),
    },
    {
      type: ['number', 'length'],
      values: { 0.5: '0.5px', 1: '1px', 1.5: '1.5px', 2: '2px', 3: '3px' },
    }
  );

  matchUtilities(
    {
      'text-stroke': (value: string) => createStrokeColorStyles(value),
    },
    {
      type: ['color'],
      values: { white: '#fff', black: '#000' },
    }
  );
};
