import { gql } from '@apollo/client';

export const TOKEN_SUPPORT_QUERY = gql`
  query TokenSupportQuery {
    supportReceipts {
      items {
        id
        weight
      }
    }
  }
`;
