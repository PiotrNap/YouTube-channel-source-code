import { gql } from "graphql-request";

export const GetLatestBlocks = gql`
  query GetLatestBlocks($from_block: Int) {
    blocks(
      where: { number: { _lt: $from_block } }
      order_by: { number: desc }
      limit: 10
    ) {
      fees
      forgedAt
    }
  }
`;

export const GetCurrentEpoch = gql`
  query GetCurrentEpoch {
    cardano {
      currentEpoch {
        startedAt
        transactionsCount
      }
    }
  }
`;

export const GetCurrentTip = gql`
  query GetCurrentTip {
    cardano {
      tip {
        number
      }
    }
  }
`;
