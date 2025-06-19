const createTextShadowStyles = (value: string) => ({
  'text-shadow': value.replace(/_/g, ' '),
});

export const textShadowPlugin = ({ matchUtilities }: any) => {
  matchUtilities({
    'text-shadow': (value: string) => createTextShadowStyles(value),
  });
};
