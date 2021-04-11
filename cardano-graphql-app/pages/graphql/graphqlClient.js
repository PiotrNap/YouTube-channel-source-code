import { GraphQLClient } from "graphql-request";
import {
  GetLatestBlocks,
  GetCurrentEpoch,
  GetCurrentTip
} from "./graphqlQueries";

export const graphqlClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_GRAPHQL_URL
);

export async function getCurrentEpoch() {
  try {
    var res = await graphqlClient.request(GetCurrentEpoch);
    return res;
  } catch (err) {
    console.error(err);
  }
}

export async function getCurrentTip() {
  try {
    var res = await graphqlClient.request(GetCurrentTip);
    return res;
  } catch (err) {
    console.error(err);
  }
}

export async function getLatestBlocks() {
  try {
    // get the number of last
    var res = await getCurrentTip();
    var blockNo = res.cardano.tip.number;

    var res = await graphqlClient.request(GetLatestBlocks, {
      $from_block: blockNo
    });
    return res;
  } catch (err) {
    console.error(err);
  }
}
