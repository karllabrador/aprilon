const SteamID = require("steamid");

class Card {
  /**
   * Constructor
   * @param name a name
   * @param steamid a Steam ID
   */
  constructor(name, steamid) {
    this.name = name;
    this.steamid = steamid;

    this.steam_name = undefined;
    this.steam_state = undefined;
    this.steam_avatar_url = undefined;

    this.#setFriendId();
  }

  /**
   * Sets the FriendID of the object. Converts the SteamID to SteamID64
   */
  #setFriendId() {
    const sid = new SteamID(this.steamid);
    this.friendid = sid.isValid() ? sid.getSteamID64() : null;
  }
}

module.exports = Card;
