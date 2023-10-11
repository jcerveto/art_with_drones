import dotenv from "dotenv";

dotenv.config();

let tempBrokerPort: number = 5000;
try {
    tempBrokerPort = Number(process.env.KAFKA_PORT) ?? 5000;
} catch (err) {
    console.error(`ERROR: wrong PORT detected. Default port (${5000}) will be used. ${err}`);
    tempBrokerPort = 5000;
}

export const BROKER_PORT: number = tempBrokerPort;
export const BROKER_HOST: string = process.env.KAFKA_HOST ?? '0.0.0.0';

// TOPICS
export const TOPIC_MAP: string = process.env.KAFKA_TOPIC_MAP ?? 'map';
export const TOPIC_TARGET_POSITION: string = process.env.KAFKA_TOPIC_TARGET_POSITION ?? 'target_position';
export const TOPIC_CURRENT_POSITION: string = process.env.KAFKA_TOPIC_CURRENT_POSITION ?? 'current_position';
export const TOPIC_KEEP_ALIVE: string = process.env.KAFKA_TOPIC_KEEP_ALIVE ?? 'keep_alive';
