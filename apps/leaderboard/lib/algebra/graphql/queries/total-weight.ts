import { gql } from '@apollo/client';

export const TOTAL_WEIGHT = gql`
query TotalWeight {
  globals {
    items {
      totalWeight
    }
  }
}`;