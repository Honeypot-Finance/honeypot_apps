import { infoClient } from ".";
import {
  GetPot2PumpDetailDocument,
  GetPot2PumpDetailQuery,
  Pot2Pump,
  CanClaimPot2PumpParticipantDocument,
  CanClaimPot2PumpParticipantQuery,
  CanRefundPot2PumpParticipantQuery,
  CanRefundPot2PumpParticipantDocument,
  CanClaimPot2PumpParticipantQueryVariables,
  CanRefundPot2PumpParticipantQueryVariables,
  GetParticipantDetailDocument,
  GetParticipantDetailQuery,
  GetParticipantDetailQueryVariables,
  GetPot2PumpDetailQueryVariables,
  GetPot2PumpByLaunchTokenDocument,
  GetPot2PumpByLaunchTokenQuery,
  GetPot2PumpByLaunchTokenQueryVariables,
} from "../generated/graphql";
import { pot2PumpListToMemePairList, pot2PumpToMemePair } from "./pair";

export const getPot2PumpContractByLaunchToken = async (launchToken: string) => {
  const pot2Pump = await getPot2PumpByLaunchToken(launchToken);

  return pot2Pump ? pot2PumpToMemePair(pot2Pump as Partial<Pot2Pump>) : null;
};

export const getPot2PumpByLaunchToken = async (launchToken: string) => {
  const res = await infoClient.query<
    GetPot2PumpByLaunchTokenQuery,
    GetPot2PumpByLaunchTokenQueryVariables
  >({
    query: GetPot2PumpByLaunchTokenDocument,
    variables: { launchToken: launchToken.toLowerCase() },
    fetchPolicy: "network-only",
  });

  return res.data?.pot2Pumps[0] ?? null;
};

export const getPot2PumpDetail = async (id: string, accountId?: string) => {
  const res = await infoClient.query<
    GetPot2PumpDetailQuery,
    GetPot2PumpDetailQueryVariables
  >({
    query: GetPot2PumpDetailDocument,
    variables: { id, accountId: accountId },
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  return res.data?.pot2Pump;
};

export const subgraphPot2PumpToMemePair = async (
  id: string,
  accountId?: string
) => {
  const pot2Pump = await getPot2PumpDetail(id, accountId);
  return pot2Pump ? pot2PumpToMemePair(pot2Pump as Partial<Pot2Pump>) : null;
};

export const canClaimPot2Pump = async (accountId: string) => {
  const res = await infoClient.query<
    CanClaimPot2PumpParticipantQuery,
    CanClaimPot2PumpParticipantQueryVariables
  >({
    query: CanClaimPot2PumpParticipantDocument,
    variables: {
      accountId: accountId.toLowerCase(),
    },
    fetchPolicy: "network-only",
  });

  const memeList = await pot2PumpListToMemePairList(
    res?.data?.participants.map((p) => p.pot2Pump) as Partial<Pot2Pump>[]
  );

  memeList?.map((meme) => {
    meme.canClaimLP = true;
  });

  return memeList;
};

export const canRefundPot2Pump = async (accountId: string) => {
  const timeNow = Math.floor(Date.now() / 1000);

  const res = await infoClient.query<
    CanRefundPot2PumpParticipantQuery,
    CanRefundPot2PumpParticipantQueryVariables
  >({
    query: CanRefundPot2PumpParticipantDocument,
    variables: {
      accountId: accountId.toLowerCase(),
      timeNow: timeNow,
    },
    fetchPolicy: "network-only",
  });

  if (!res?.data?.participants) {
    console.error(
      "Failed to fetch refundable pot2pump participants:",
      res.error
    );
    return [];
  }

  const memeList = await pot2PumpListToMemePairList(
    res?.data?.participants.map((p) => p.pot2Pump) as Partial<Pot2Pump>[]
  );

  memeList?.map((meme) => {
    meme.canRefund = true;
  });

  return memeList;
};

export const getParticipantDetail = async (
  accountId: string,
  pot2PumpId: string
) => {
  const res = await infoClient.query<
    GetParticipantDetailQuery,
    GetParticipantDetailQueryVariables
  >({
    query: GetParticipantDetailDocument,
    variables: { accountId, pot2PumpId },
  });

  return res.data?.participants[0] ?? null;
};
