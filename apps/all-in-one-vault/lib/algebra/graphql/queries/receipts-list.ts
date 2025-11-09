import { gql } from '@apollo/client';

export const RECEIPTS_LIST = gql`
  query ReceiptsList($user: String!) {
    receipts(
      where: { user: $user }
      orderBy: "id"
      orderDirection: "desc"
      limit: 1000
    ) {
      items {
        claimableAt
        id
        isClaimed
        receiptId
        receiptWeight
        token
        user
      }
    }
  }
`;
