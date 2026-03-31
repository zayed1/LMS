/**
 * GCDC Brand Colors
 *
 * Primary palette:
 *   Balance    #F3F3F4
 *   Trust      #93A3CF
 *   Reliability #0D3269
 *
 * Secondary palette:
 *   Prosperity    #069005
 *   Power         #DD1803
 *   Resilience    #0D0002
 *   Determination #63F03F
 */

export const gcdcColors = {
  primary: {
    balance: {
      DEFAULT: "#F3F3F4",
      100: "#F3F3F4",
      75: "#F5F5F6",
      50: "#F9F9F9",
      25: "#FCFCFD",
    },
    trust: {
      DEFAULT: "#93A3CF",
      100: "#93A3CF",
      75: "#AEB9DB",
      50: "#C9D1E7",
      25: "#E4E8F3",
    },
    reliability: {
      DEFAULT: "#0D3269",
      100: "#0D3269",
      75: "#4C658E",
      50: "#8698B4",
      25: "#C3CCDA",
    },
  },
  secondary: {
    prosperity: "#069005",
    power: "#DD1803",
    resilience: "#0D0002",
    determination: "#63F03F",
  },
} as const;
