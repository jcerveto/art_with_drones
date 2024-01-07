export async function sleep(ms: number): Promise<void> {
    console.log("Sleeping for " + ms + " ms at " + new Date().toISOString());
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}