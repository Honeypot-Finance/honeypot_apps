import { gql } from '@apollo/client';

export const GET_BITGET_EVENTS_INFO = gql`
  query getBitgetEvents($user: ID) {
    bitgetCampaigns {
      totalVolumeUSD
      totalFinishedUserCount
      eventPools {
        pool {
          ...PoolFields
        }
        totalVolumeUSD
        totalFinishedUserCount
        top10Users: finishedUsers(orderBy: amountUSD, orderDirection: desc) {
          user {
            ...AccountField
          }
          amountUSD
          finished
        }
        currentUser: finishedUsers(where: { user_: { id: $user } }) {
          user {
            ...AccountField
          }
          amountUSD
          finished
        }
      }
    }
  }
`;

export const GET_SINGLE_BITGET_PARTICIPANT_INFO = gql`
  query getSingleBitgetParticipantInfo($user: String!) {
    bitgetCampaignParticipants(where: { user: $user }) {
      user {
        id
      }
      amountUSD
      pool {
        id
        totalVolumeUSD
      }
    }
  }
`;

export const GET_BITGET_EVENTS_PARTICIPANT_LIST = gql`
  query getBitgetEventsParticipantList($skip: Int, $first: Int) {
    bitgetCampaignParticipants(
      skip: $skip
      first: $first
      where: { amountUSD_gt: 10 }
      orderBy: amountUSD
      orderDirection: desc
    ) {
      pool {
        id
        totalVolumeUSD
      }
      user {
        id
      }
      amountUSD
    }
  }
`;
