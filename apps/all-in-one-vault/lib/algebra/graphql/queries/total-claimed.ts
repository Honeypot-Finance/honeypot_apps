import { gql } from '@apollo/client';

export const TOTAL_CLAIMED = gql`
query TotalClaimed {
  globals {
    items {
      totalClaimed
    }
  }
}`;