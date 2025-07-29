const globalForChallenge = globalThis as unknown as {
  challengeStore?: Map<string, string>;
  registrationChallengeStore?: Map<string, string>;
};

globalForChallenge.challengeStore = globalForChallenge.challengeStore || new Map();
globalForChallenge.registrationChallengeStore = globalForChallenge.registrationChallengeStore || new Map();

const challengeStore = globalForChallenge.challengeStore;

export const storeChallengeMap = async (userId: string, challenge: string) => {
  challengeStore.set(userId, challenge);
};

export const getChallengeMap = async (userId: string): Promise<string | undefined> => {
  return challengeStore.get(userId);
};

export const deleteChallengeMap = async (userId: string) => {
  challengeStore.delete(userId);
};