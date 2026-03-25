import { Contributor } from "./contributor";

export type SteamProfile = {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileUrl: string;
};

export type ContributorWithSteam = Contributor & {
  steam?: SteamProfile;
};
