import { gcdcColors } from "./colors";

const gcdcPreset = {
  theme: {
    extend: {
      colors: {
        balance: gcdcColors.primary.balance,
        trust: gcdcColors.primary.trust,
        reliability: gcdcColors.primary.reliability,
        prosperity: gcdcColors.secondary.prosperity,
        power: gcdcColors.secondary.power,
        resilience: gcdcColors.secondary.resilience,
        determination: gcdcColors.secondary.determination,
      },
    },
  },
};

export default gcdcPreset;
