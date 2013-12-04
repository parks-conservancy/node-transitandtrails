"use strict";

var assert = require("assert"),
    util = require("util");

var async = require("async"),
    request = require("crequest");

var TNT_URL_PREFIX = process.env.TNT_URL_PREFIX || "https://api.transitandtrails.org";

var TnT = function(options) {
  options = options || {};

  options.key = options.key || process.env.TNT_API_KEY;

  this.key = options.key;
};

TnT.prototype.toString = function() {
  return "[TransitAndTrails]";
};

TnT.prototype.get = function(options, callback) {
  assert.ok(this.key, "An API key is required.");

  if (typeof options === "string") {
    options = {
      url: options
    };
  }

  options.url = TNT_URL_PREFIX + options.url;

  options.qs = options.qs || {};

  // filter out undefined / null values
  Object.keys(options.qs).forEach(function(x) {
    if (options.qs[x] === undefined ||
        options.qs[x] === null) {
      delete options.qs[x];
    }
  });

  options.qs.key = this.key;

  return request.get(options, function(err, res, body) {
    if (res.statusCode !== 200) {
      return callback(body);
    }

    // reverse the order of body and res since clients shouldn't care about res
    return callback(err, body, res);
  });
};

//
// Attribute Categories
//

TnT.prototype.getAttributeCategories = function(options, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get({
    url: "/api/v1/attribute_categories",
    qs: options
  }, callback);
};

//
// Campgrounds
//

TnT.prototype.getCampground = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get("/api/v1/campgrounds/" + id, callback);
};

TnT.prototype.getCampgroundAttributes = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  var path = "/api/v1/campground_attributes";

  if (id) {
    path = util.format("/api/v1/campgrounds/%d/attributes", id);
  }

  return this.get(path, callback);
};

TnT.prototype.getCampgroundMaps = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get(util.format("/api/v1/campgrounds/%d/maps", id), callback);
};

TnT.prototype.getCampgroundPhotos = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get(util.format("/api/v1/campgrounds/%d/photos", id), callback);
};

TnT.prototype.getCampgrounds = function(options, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get({
    url: "/api/v1/campgrounds",
    qs: options
  }, callback);
};

//
// Trailheads
//

TnT.prototype.getTrailhead = function(id, callback) {
  return this.get("/api/v1/trailheads/" + id, callback);
};

TnT.prototype.getTrailheadAsGeoJSON = function(id, callback) {
  var self = this;

  return async.parallel({
    trailhead: function(done) {
      return self.getTrailhead(id, done);
    },
    attributes: function(done) {
      return self.getTrailheadAttributes(id, done);
    }
  }, function(err, data) {
    if (err) {
      return callback(err);
    }

    var trailhead = data.trailhead[0],
        attributes = data.attributes[0];

    trailhead.attributes = attributes.map(function(x) {
      return x.name;
    });

    var feature = {
      id: trailhead.id,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [trailhead.longitude, trailhead.latitude]
      },
      properties: trailhead
    };

    delete feature.properties.latitude;
    delete feature.properties.longitude;

    return callback(null, feature);
  });
};

TnT.prototype.getTrailheadAttributes = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  var path = "/api/v1/trailhead_attributes";

  if (id) {
    path = util.format("/api/v1/trailheads/%d/attributes", id);
  }

  return this.get(path, callback);
};

TnT.prototype.getTrailheadPhotos = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get(util.format("/api/v1/trailheads/%d/photos", id), callback);
};

TnT.prototype.getTrailheadMaps = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get(util.format("/api/v1/trailheads/%d/maps", id), callback);
};

TnT.prototype.getTrailheads = function(options, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get({
    url: "/api/v1/trailheads",
    qs: options
  }, callback);
};

//
// Trips
//

TnT.prototype.getTrip = function(id, callback) {
  return this.get("/api/v1/trips/" + id, callback);
};

TnT.prototype.getTripAsGeoJSON = function(id, callback) {
  var self = this;

  var getAuthor = async.memoize(this.getUser.bind(this));

  return async.parallel({
    trip: function(done) {
      return self.getTrip(id, function(err, trip) {
        if (err) {
          return done(err);
        }

        return getAuthor(trip.author_id, function(err, user) {
          trip.author = user;
          return done(err, trip);
        });
      });
    },
    route: function(done) {
      return self.getTripRoute(id, done);
    },
    attributes: function(done) {
      return self.getTripAttributes(id, done);
    }
  }, function(err, data) {
    if (err) {
      return callback(err);
    }

    var trip = data.trip,
        route = data.route[0],
        attributes = data.attributes[0];

    trip.attributes = attributes.map(function(x) {
      return x.name;
    });

    var feature = {
      id: trip.id,
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: route
      },
      properties: trip
    };

    return callback(null, feature);
  });
};

TnT.prototype.getTripAttributes = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  var path = "/api/v1/trip_attributes";

  if (id) {
    path = util.format("/api/v1/trips/%d/attributes", id);
  }

  return this.get(path, callback);
};

TnT.prototype.getTripPhotos = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get(util.format("/api/v1/trips/%d/photos", id), callback);
};

TnT.prototype.getTripMaps = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get(util.format("/api/v1/trips/%d/maps", id), callback);
};

TnT.prototype.getTripRoute = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get(util.format("/api/v1/trips/%d/route", id), function(err, body, res) {
    if (err) {
      return callback(err, body, res);
    }

    var route;

    try {
      // route is stringified JSON (not JSON)
      route = JSON.parse(body.route);
    } catch (e) {
      return callback(e);
    }

    // flip coords to (x,y) order
    route = route.map(function(x) {
      return [x[1], x[0]];
    });

    return callback(null, route, res);
  });
};

TnT.prototype.getTrips = function(options, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get({
    url: "/api/v1/trips",
    qs: options
  }, callback);
};

//
// Users
//

TnT.prototype.getUser = function(id, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get("/api/v1/users/" + id, callback);
};

TnT.prototype.getUsers = function(options, callback) {
  callback = Array.prototype.slice.call(arguments).pop();

  return this.get({
    url: "/api/v1/users",
    qs: options
  }, callback);
};

module.exports = TnT;
