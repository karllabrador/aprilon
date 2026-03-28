# Aprilon

Source code for [the aprilon.org website](https://aprilon.org). Built with Next.js and Tailwind.

![Preview](https://i.imgur.com/DKgk7Kx.jpeg)

## About

Aprilon was a gaming community founded in 2009, starting with a simple Garry's Mod sandbox server. Over the years it expanded into Team Fortress 2 and Minecraft, growing a solid player base along the way — before eventually closing its doors in May 2015.

This app serves as a legacy archive: a way to thank everyone who contributed through development, management, and moderation, and to show just how many people passed through the community over the years.

The data comes from our archives at the time of closing — sourced from HLStatsX:CE (TF2) and our own in-house tools for Garry's Mod and Minecraft.

**_Contributors:_** _If you're missing from the contributors list or want to be removed, reach out to me or feel free to open a pull request with changes to `config/contributors.json`._

## Running the project

Prerequisites: Node, NPM

1. Run `npm install`
2. Run `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

Create a `.env` file in the root with the following content:

```
STEAM_API_KEY=<your api key>
```

[Get your personal key from Steam here](https://steamcommunity.com/dev/apikey). The app uses the Steam API to pull data from Steam Community profiles (name, online status and avatar).
