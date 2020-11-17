/**
 * Aprilon.js
 * Dependencies: jQuery >=3.5.1
 */

/**
 * Cards
 */
const cards = {};

cards.config = {
    url: '/cards.json'
}

cards.fetchData = () => {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', this.config.url, false);
    xmlHttp.send(null);

    if (xmlHttp.responseText) {
        if (JSON) {
            return JSON.stringify(xmlHttp.responseText);
        }
    }
}

cards.buildCard = data => {

}

cards.run = () => {
    let data = this.fetchData();
    data.forEach((card) => {
        this.buildCard(card);
    });
}
/**
 * Counting Animation
 */
const countUp = {};

countUp.config = {
    duration: 2000,
    selector: '.countup'
}

countUp.animate = e => {
    let size = e.html().split(".")[1] ? e.html().split(".")[1].length : 0;
    console.log('Size: ' + size);
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

countUp.run = () => {
    $(countUp.config.selector).each(function() {
        countUp.animate($(this));
    })
}

$(function() {
    countUp.run();
});
