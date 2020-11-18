/**
 * Aprilon.js
 * Dependencies: jQuery >=3.5.1
 */

/**
 * Cards
 */
const cards = {};

cards.config = {
    url: '/cards.json',
    selector: '.cards'
}

/**
 * Fetches the generated cards json file and builds the card html, and appends it to the cards columns
 */
cards.fetchData = () => {
    $.getJSON(cards.config.url, data => {
       let items = [];

       $.each(data, function(key, val) {
           let friendid = val.friendid;
           let desc = ((val.desc) ? val.desc : '');
           let steam_name = val.steam_name;
           let steam_avatar_url = val.steam_avatar_url;
           let steam_state_class = cards.getStateClass(val.steam_state);

           let html =
               '<div class="column is-one-third">' +
               '    <div class="card">'+
               '        <div class="avatar is-pulled-left' + steam_state_class + '">' +
               '            <img src="' + steam_avatar_url + '" />' +
               '        </div>' +
               '        <div class="details is-pulled-left">' +
               '            <p class="name is-size-4"><a href="https://steamcommunity.com/profiles/' + friendid + '" class="has-text-light">' + steam_name + '</a></p>' +
               '            <p class="heading">' + desc + '</p>' +
               '        </div>' +
               '        <div style="display:inline-block" class="is-pulled-right"><p></p></div>' +
               '        <div class="is-clearfix"></div>' +
               '    </div>' +
               '</div>'

           items.push(html);
       });

       items.forEach((item) => {
          $(cards.config.selector).append(item);
       });
    });
}

/**
 * Evaluates the personastate code, where 0 is offline, 1-6 is online and 7 is in-game
 * @param c
 * @returns {string}
 */
cards.getStateClass = c => {
    if (c === 7) return ' is-ingame';
    if (c >= 1) return ' is-online';
    else return ' ';
}

/**
 * Counting Animation
 */
const countUp = {};

countUp.config = {
    duration: 2000,
    selector: '.countup'
}

/**
 * Reads the number within the elements inner html and runs the counting animation
 */
countUp.animate = e => {
    let size = e.html().split(".")[1] ? e.html().split(".")[1].length : 0;
    e.prop('Counter', 0).animate({
        Counter: e.text()
    }, {
        duration: countUp.config.duration,
        easing: 'swing',
        step: function(now) {
            e.html(parseFloat(now).toFixed(size));
        }
    });
}

/**
 * Adds animations to the configured selector
 */
countUp.run = () => {
    $(countUp.config.selector).each(function() {
        countUp.animate($(this));
    })
}

$(function() {
    // Look for countups and run animation
    countUp.run();

    // Fetch cards data
    cards.fetchData();

    // Simple loading animation for download buttons using Bulma classes
    $('.download-button').click(function() {
        const el = $(this);
        el.addClass("is-loading");

        setInterval(function() {
            el.removeClass("is-loading");
        }, 2000)
    })
});