# Aprilon

This is the app running [on the aprilon.org website](https://aprilon.org), written with nodejs, sass and js.

![Preview](https://i.imgur.com/XkSpEzP.jpg)

## Configuration

For the app to function properly, it requires a ```aprilon-config.json``` file. Below is a config template.

```
{
  "production": {
    "config": "production",
    "cards": {
      "steam_api_key": "<your Steam API key>",
      "reference_file": "config/contributors.json",
      "debug": false
    }
  },
  "development": {
    "config": "development",
    "cards": {
      "steam_api_key": "<your Steam API key>",
      "reference_file": "config/contributors.json",
      "debug": true
    }
  }
}
```

## Backstory

Aprilon was once a gaming community that was founded in 2009, starting out with a simple Garry's Mod
sandbox server.

It further expanded into Team Fortress 2 and Minecraft in the later years, and the playerbase growth and community was strong.

As personal interests in the management dwindled, community operations closed (for the second time hehe) in May 2015.

The purpose of this app is act as a legacy to the community history, where I show my thanks to those who contributed to the project in development, management and moderation.

At the same time, I can't help myself but show how many individuals actually stepped into the community in some way or another, through data we've recorded throughout its time.

The data I've gathered are based on analysis of our latest SQL data backups from sources such as HLStatsX:CE (for TF2), and our own in-house developed management tools for Garry's Mod and Minecraft.

## Feedback

I'm very newb with this stack and using this as an opportunity to get familiar. I'm very thankful for feedback!
