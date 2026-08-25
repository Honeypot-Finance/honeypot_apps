import { makeAutoObservable } from "mobx";
import { MemePairContract } from "./contract/launches/pot2pump/memepair-contract";
import BigNumber from "bignumber.js";
import { liquidity } from "./liquidity";
import { get } from "lodash";
import { Token } from '@honeypot/shared';
import { FtoPairContract } from "./contract/launches/fto/ftopair-contract";
import { wallet } from '@honeypot/shared/lib/wallet';

export type EventState = "preview" | "active" | "ended";
export type MemeWarParticipant = {
  type: "fto" | "meme";
  participantName: string;
  pairAddress: string;
  pair?: FtoPairContract | MemePairContract;
  tokenAddress: string;
  token?: Token;
  iconUrl?: string;
  finalScore?: BigNumber;
  currentScore: BigNumber;
  isPairInitialized?: boolean;
};

const tHpotAddress = "0xfc5e3743e9fac8bb60408797607352e24db7d65e";

export class MemewarStore {
  memewarState: EventState = "active";
  memewarParticipants: Record<string, MemeWarParticipant> = {
    BERANEIRO: {
      type: "meme",
      participantName: "Bera Neiro",
      pairAddress: "0x4A54e266279C0715445C9Ae4f57894cD8e8B9Fb7",
      tokenAddress: "0x8b045d02c581284295be33d4f261f8e1e6f78f18",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERAPEPE: {
      type: "meme",
      participantName: "Bera Pepe",
      pairAddress: "0x5a42fefa75b0adebd63d3078c2f1e3e9a6c39177",
      tokenAddress: "0xff4abcd6d4cea557e4267bc81f1d2064615cb49e",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERAMOG: {
      type: "meme",
      participantName: "Bera Mog",
      pairAddress: "0x8696b803174F254E8c9Afdf3Fb713e5931755370",
      tokenAddress: "0x3F7AAE503000A08A8d4A9AFefa738b565f3A6CD6",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERADOGWIFHAT: {
      type: "meme",
      participantName: "Bera Dog Wif Hat",
      pairAddress: "0x295Fd12782Ae118d93Ea903D66a322Cc7cEfbdD5",
      tokenAddress: "0xEF348b9FD378c91b00874d611b22062d7ee60284",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERAPOPCAT: {
      type: "meme",
      participantName: "Bera Popcat",
      pairAddress: "0x8011F8fd78001D027556D7607d23Aa003c425c11",
      tokenAddress: "0x51A42ceAFDA32F68390840A187b65a99584332df",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERAGIGACHAD: {
      type: "meme",
      participantName: "Bera Giga Chad",
      pairAddress: "0x4238B8CCD693749e4b46b5c5DFC087da9661218D",
      tokenAddress: "0x96dc300D5406E42051575B8b49d3057F1Ef678FC",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERAGOAT: {
      type: "meme",
      participantName: "Bera Goat",
      pairAddress: "0xb3e9CEd28D6d9F50A3857c77B838e4226d7cF525",
      tokenAddress: "0x0874955158639A594fd65641E16C7de91F3dF465",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERAMOODENG: {
      type: "meme",
      participantName: "Bera Moo Deng",
      pairAddress: "0x81A443e25F139b8090FF3Ce19B6707e0D55006d5",
      tokenAddress: "0x5c648D0Fd479cAFB9638eB94dB50aAA4d6A58c33",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERARETADRIO: {
      type: "meme",
      participantName: "Bera Retadrio",
      pairAddress: "0xc0D158540537BBd46058B0DEB5b3a28f6BC24FFC",
      tokenAddress: "0xFa9FB9d84525e4fE6c7DEaE137e3f1C81F86FdF8",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
    BERAAPU: {
      type: "meme",
      participantName: "Bera Apu",
      pairAddress: "0xf24438e67f9c5b9ee5284b6a7ee9e43b5f56e0f3",
      tokenAddress: "0x96d62fbd15608ef087219f20986735a1d65a22a4",
      iconUrl: "",
      currentScore: new BigNumber(0),
      finalScore: new BigNumber(0),
    },
  };
  selectedSupportParticipantPair:
    | FtoPairContract
    | MemePairContract
    | undefined = undefined;
  supportAmount = new BigNumber(0);
  tHpotToken: Token | undefined = undefined;

  get sortedMemewarParticipants() {
    return Object.values(this.memewarParticipants).sort(
      (a, b) => b.currentScore.toNumber() - a.currentScore.toNumber()
    );
  }

  get isInit() {
    return Object.values(this.memewarParticipants).every(
      (participant) => participant.isPairInitialized
    );
  }

  constructor() {
    makeAutoObservable(this);
  }

  reloadParticipants = async () => {
    this.tHpotToken = Token.getToken({ chainId: wallet.currentChainId.toString(), address: tHpotAddress });
    await this.tHpotToken.init();
    Object.keys(this.memewarParticipants).forEach((key) => {
      this.memewarParticipants[key].isPairInitialized = false;
      this.initParticipant(this.memewarParticipants[key].pairAddress);
    });

    console.log(this.memewarParticipants);
  };

  updateAllParticipantScore = async () => {
    await Promise.all(
      Object.keys(this.memewarParticipants).map(async (key) => {
        const participant = this.memewarParticipants[key];
        const score = await this.loadScore(
          participant.pair?.launchedToken?.address || key
        );
        participant.currentScore = score;
      })
    );
  };

  initParticipant = async (address: string) => {
    const participant = this.getParticipantByAddress(address);
    if (!participant) return;

    const pair =
      participant.type === "fto"
        ? new FtoPairContract({ address })
        : new MemePairContract({ address });
    const token = Token.getToken({ chainId: wallet.currentChainId.toString(), address: participant.tokenAddress });
    await pair.init();
    await Promise.all([
      await token.init(),
      await pair.raiseToken?.init(),
      await pair.launchedToken?.init(),
    ]);
    const score = await this.loadScore(pair.launchedToken?.address || address);

    participant.pair = pair;
    participant.token = pair.launchedToken ?? token;
    participant.currentScore = score;

    participant.isPairInitialized = true;

    return pair;
  };

  getParticipantByAddress = (address: string) => {
    return Object.values(this.memewarParticipants).find(
      (participant) => participant.pairAddress === address
    );
  };

  loadScore = async (address: string): Promise<BigNumber> => {
    if (this.memewarState === "preview") {
      return new BigNumber(0);
    }
    if (this.memewarState === "ended") {
      return (
        this.getParticipantByAddress(address)?.finalScore || new BigNumber(0)
      );
    }

    const poolPair = await liquidity.getPairByTokens(
      address.toLowerCase(),
      tHpotAddress.toLowerCase()
    );

    console.log("poolPair", poolPair);

    await poolPair?.init();
    await poolPair?.getReserves();

    const launchTokenReserve =
      poolPair?.token0.address.toLowerCase() === address.toLowerCase()
        ? poolPair?.reserves?.reserve0
        : poolPair?.reserves?.reserve1;
    const hpotReserve =
      poolPair?.token0.address.toLowerCase() === tHpotAddress.toLowerCase()
        ? poolPair?.reserves?.reserve0
        : poolPair?.reserves?.reserve1;
    const launchTokenAmount =
      poolPair?.token0.address.toLowerCase() === address.toLowerCase()
        ? await poolPair?.token0.getTotalSupply()
        : await poolPair?.token1.getTotalSupply();

    console.log("hpotReserve", hpotReserve);
    console.log("launchTokenReserve", launchTokenReserve);
    console.log("launchTokenAmount", launchTokenAmount);

    if (!launchTokenReserve || !hpotReserve || !launchTokenAmount) {
      return new BigNumber(0);
    }
    return new BigNumber(
      (hpotReserve.toNumber() / launchTokenReserve.toNumber()) *
        (launchTokenAmount.toNumber() / Math.pow(10, 18))
    );
  };

  setSupportAmount = (amount: string) => {
    this.supportAmount = new BigNumber(amount);
  };

  setSelectedSupportParticipant = (
    address: string | MemePairContract | FtoPairContract
  ) => {
    if (typeof address === "object") {
      this.selectedSupportParticipantPair = address;
      return;
    }

    this.selectedSupportParticipantPair =
      this.getParticipantByAddress(address)?.pair;
  };
}

export const memewarStore = new MemewarStore();
