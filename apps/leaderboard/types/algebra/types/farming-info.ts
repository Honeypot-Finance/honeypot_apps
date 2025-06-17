import {
  EternalFarming,
  SinglePoolQuery,
  TokenFieldsFragment,
} from "@/lib/algebra/graphql/generated/graphql";

export interface Farming {
  farming: EternalFarming;
  rewardToken: TokenFieldsFragment;
  bonusRewardToken: TokenFieldsFragment | null;
  pool: SinglePoolQuery["pool"];
}
