import Head from "next/head";
import { getCurrentEpoch, getLatestBlocks } from "./graphql/graphqlClient";
import { useState } from "react";
import styles from "../styles/home.module.css";

export default function Home() {
  const [data, setData] = useState(null);

  const currentEpoch = async () => {
    var data = await getCurrentEpoch();
    setData(data);
  };

  const latestBlocks = async () => {
    var data = await getLatestBlocks();
    setData(data);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Cardano graphql explorer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Cardano-graphql-explorer</h1>
      <div className={styles.grid}>
        <button className={styles.card} onClick={() => currentEpoch()}>
          Get the current epoch
        </button>
        <button className={styles.card} onClick={() => latestBlocks()}>
          Get latest 10 blocks
        </button>
      </div>
      <div className={styles.grid}>
        <div className={styles.code}>
          {data ? <code>{JSON.stringify(data)}</code> : ""}
        </div>
      </div>
    </div>
  );
}
