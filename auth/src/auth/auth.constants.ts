export type Error = [string, number];

export const USER_NOT_FOUND_ERROR: Error = ['USER_NOT_FOUND_ERROR', 404];
export const WRONG_PASSWORD_ERROR: Error = ['WRONG_PASSWORD_ERROR', 400];
export const USER_ALREADY_EXISTS_ERROR: Error = ['USER_ALREADY_EXISTS_ERROR', 400];
