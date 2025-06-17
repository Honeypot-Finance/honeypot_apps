import { gql } from '@apollo/client';

export const RECEIPTS_LIST = gql`
  query ReceiptsList($user: String!) {
    receipts(where: { user: $user }) {
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
