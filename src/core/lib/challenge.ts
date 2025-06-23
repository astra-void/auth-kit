const globalForChallenge = globalThis as unknown as {
  challengeStore?: Map<string, string>;
  registrationChallengeStore?: Map<string, string>;
};

globalForChallenge.challengeStore = globalForChallenge.challengeStore || new Map();
globalForChallenge.registrationChallengeStore = globalForChallenge.registrationChallengeStore || new Map();

const challengeStore = globalForChallenge.challengeStore;
const registrationChallengeStore = globalForChallenge.registrationChallengeStore;

export const storeChallenge = (email: string, challenge: string) => {
  challengeStore.set(email, challenge);
};

export const getChallenge = (email: string): string | undefined => {
  return challengeStore.get(email);
};

export const deleteChallenge = (email: string) => {
  challengeStore.delete(email);
};

export const storeRegistrationChallenge = (userId: string, challenge: string) => {
  registrationChallengeStore.set(userId, challenge);
};

export const getRegistrationChallenge = (userId: string): string | undefined => {
  return registrationChallengeStore.get(userId);
};

export const deleteRegistrationChallenge = (userId: string) => {
  registrationChallengeStore.delete(userId);
};
