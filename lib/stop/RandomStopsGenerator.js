'use strict';

const Config = require('../util/Config.js');
const StopsGenerator = require('./StopsGenerator.js');
const Point = require('../util/Point.js');

class RandomStopsGenerator extends StopsGenerator {
    constructor(region, config) {
        super(region, config);

        var param_scope = "stops:";
        this.param_seed = Config.value(config, 'seed', 1); // Random seed
        this.param_stops = Config.value(config, param_scope + 'stops', 600); // The number of stops to generate
    }

    random() {
        var x = Math.sin(this.param_seed++) * 10000;
        return x - Math.floor(x);
    }

    generate() {
        for (var i = 0; i < this.param_stops; i++) {
            var point = this.region.points[Math.floor(this.random() * this.region.points.length)];
            if (!this.region.markStation(point.x, point.y)) i--;
        }
        return this;
    }
}

module.exports = RandomStopsGenerator;