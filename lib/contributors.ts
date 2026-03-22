import data from "@/config/contributors.json";

export type Contributor = {
  name: string;
  steamId: string;
  roles: string | string[];
  github?: string;
};

export const contributors: Contributor[] = data;
