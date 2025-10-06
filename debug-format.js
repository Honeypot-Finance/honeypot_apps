// Simple debug script to test formatVolume function
const formatVolume = (volume) => {
  const value = volume;

  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }

  return `${value.toFixed(2)}`;
};

console.log('formatVolume(1000000000):', formatVolume(1000000000));
console.log('formatVolume(1000000):', formatVolume(1000000));
console.log('formatVolume(1000):', formatVolume(1000));
console.log('formatVolume(999):', formatVolume(999));