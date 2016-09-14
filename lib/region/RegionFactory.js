'use strict';

const fs = require('fs');
const csvparse = require('csv-parse');
const transform = require('stream-transform');

const Region = require('./Region.js');
const Point = require('./../util/Point.js');
const TripsVisualizer = require('./../visualize/TripsVisualizer.js');

class RegionFactory {
    constructor(region_cells_filepath, mark_stops, mark_edges) {
        this.region_cells_filepath = region_cells_filepath;
        this.mark_stops = mark_stops;
        this.mark_edges = mark_edges;
    }

    createRegion(cb) {
        this.prepareData(new Region())
          .then(({ region, edges, routes }) => {
              cb(region, edges, routes);
          })
          .catch(function(error) {
              console.error(error.stack);
          });
    }

    consumeFile(filename, consumer, delimiter) {
        return new Promise((resolve, reject) => {
            var parser = csvparse({delimiter: delimiter || ','});
            var input = fs.createReadStream(filename);
            var first = true;
            var transformer = transform((record, callback) => {
                if (first) {
                    first = false;
                } else {
                    consumer(record);
                }
                callback(null);
            }, reject);

            input.pipe(parser).pipe(transformer).on('finish', resolve);
        });
    }

    prepareData(region) {
        var prepareResult = this.consumeFile(this.region_cells_filepath, (record) => {
            var point = new Point(parseInt(record[0]), parseInt(record[1]), parseFloat(record[4]));
            if (point.value > 0) point.value = Math.log(point.value + 1);
            region.put(point);
            if (this.mark_stops && record[5] == "1") {
                region.markStation(point.x, point.y);
            }
        }).then(() => {
            region.points.sort(function(a, b) {
                return b.value - a.value;
            });
            return { region: region };
        });
        if (this.mark_edges) {
            prepareResult = prepareResult
              .then(({ region: region }) => this.loadEdges(region));
        }
        return prepareResult;
    }

    loadEdges(region) {
        var edges = [];
        var routes = [];
        var routeIds = {};
        return this.consumeFile('input_data/region_edges.csv', (record) => {
            var from = new Point(parseInt(record[0]), parseInt(record[1]), 0);
            var to = new Point(parseInt(record[2]), parseInt(record[3]), 0);
            var tripId = record[4];
            var arrivalTime = record[5];
            var departureTime = record[6];
            if (from && to) {
                var edge = { from: from, to: to };
                edges.push(edge);
                var routeId = routeIds[tripId];
                if (!routeId && routeId !== 0) {
                    routeId = routes.length;
                    routeIds[tripId] = routeId;
                    routes[routeId] = { routeId: routeId, edges: [] };
                }
                routes[routeId].edges.push(edge);

            }
        }).then(() => { return { region: region, edges: edges, routes: routes } });
    }
}

module.exports = RegionFactory;