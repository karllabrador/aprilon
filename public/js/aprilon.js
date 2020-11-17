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


/**
 * Counting Animation
 */
const countUp2 = {};

/**
 * Configuration for the countUp animation
 * @type {{animDuration: number, frameDuration: number, totalFrames: number}}
 */
countUp2.config = {
    animDuration: 2000,
    frameDuration: 1000 / 60,
    selector: '.countup'
}

countUp2.config.totalFrames = Math.round(countUp2.config.animDuration / countUp2.config.frameDuration)

/**
 * Progress calculation
 * @param t
 * @returns {number}
 */
countUp2.easeOut = t => t * (2 - t);

/**
 * countUp Animation
 * @param e html element
 */
countUp2.animate = e => {
    let frame = 0;
    const countTo = parseFloat(e.html());
    console.log(countUp2.config);

    const counter = setInterval(() => {

        frame++;
        const progress = countUp2.easeOut(frame / countUp2.config.totalFrames);
        const count = Math.round(countTo * progress);

        //console.log(count);

        if (parseFloat(e.html()) !== count) {
            e.html(count);
        }

        if (frame === countUp2.config.totalFrames)
            clearInterval(counter);
    }, countUp2.frameDuration);
};

/**
 * Run method that animation all elements with the selector class name
 */
countUp2.run = () => {
    $(countUp2.config.selector).each(function() {
        countUp2.animate($(this));
    })
}

/**
 * Run when ready
 */
/*
$(function() {
    countUp2.run();
});

 */