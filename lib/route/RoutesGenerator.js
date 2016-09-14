'use strict';

/* A RoutesGenerator generates a list of routes. */
class RoutesGenerator {
    constructor(region, edges) {
        this.region = region;
        this.edges = edges; // [ ... { from, to } ... ]; tripId's are their index in this array
        this.nextTripId = 0;
        this.routes = []; // [ ... { routeId, [ ... edgeId ... ] } ... ]
    }

    addRoute(trips){
        var routeId = this.routes.length;
        this.routes.push({ routeId: routeId, trips: trips });
    }

    generate() {
        throw new Error('RoutesGenerator#generate() has not been implemented yet.');
    }

    getRoutes() {
        return this.routes;
    }
}

module.exports = RoutesGenerator;