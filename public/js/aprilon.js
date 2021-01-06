/**
 * aprilon.js
 * Dependencies: jQuery >=3.5.1
 */

/**
 * Cards
 */
const cards = {};

cards.config = {
    url: '/data/cards.json',
    selector: '.cards'
}

/**
 * Fetches the generated cards json file and builds the card html, and appends it to the cards columns
 */
cards.fetchData = () => {
    $.getJSON(cards.config.url, data => {
       $.each(data, (key, val) => $(cards.config.selector).append(cards.buildCard(val)));
    });
}

/**
 * Builds the HTML for a card
 * @param v fetched data values from Steam API call
 * @returns {string|void}
 */
cards.buildCard = v => {
    if (!v) return console.log('buildCard: invalid value');

    // Buttons
    let buttons = '';
    if (v.github) buttons += `<a href="https://github.com/${v.github}"><img src="/img/github-mark-64px.png" width="28px" alt="Github logo" /></a>`

    // Is previously known name different from current?
    let nameblock = `<a href="https://steamcommunity.com/profiles/${v.friendid}" class="has-text-light has-tooltip-right has-tooltip-hidden-touch" data-tooltip="alias: ${v.name}">`
    if (v.steam_name.includes(v.name)) {
        nameblock = `<a href="https://steamcommunity.com/profiles/${v.friendid}" class="has-text-light">`
    }

    // Resolve descriptions (a card can have multiple)
    let desc = v.desc;
    if (Array.isArray(v.desc)) {
        desc = '';
        $.each(v.desc, (key, val) => {
            desc += (val + '<br />');
        });
    }

    return `
        <div class="column is-one-third">
            <div class="card">
                <div class="avatar is-pulled-left${cards.getStateClass(v.steam_state)}">
                    <img src="${v.steam_avatar_url}" alt="${v.steam_name}'s steamcommunity.com avatar"/>
                </div>
                <div class="details is-pulled-left">
                    <p class="name is-size-4">
                        ${nameblock}
                            ${v.steam_name}
                        </a>
                    </p>
                    <p class="heading">
                        ${desc}
                    </p>
                </div>
                <div style="display:inline-block" class="is-pulled-right">
                    ${buttons}
                </div>
                <div class="is-clearfix"></div>
            </div>
        </div>
    `
}

/**
 * Evaluates the personastate code, where 0 is offline, 1-6 is online and 7 is in-game
 * @param c
 * @returns {string}
 */
cards.getStateClass = c => {
    if (c === 7) return ' is-ingame';
    if (c >= 1) return ' is-online';
    else return '';
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
        const button = $(this);
        button.addClass("is-loading");

        setInterval(function() {
            button.removeClass("is-loading");
        }, 2000)
    })
});