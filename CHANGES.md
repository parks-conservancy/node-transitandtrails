# Change Log

## v0.1.3 11/7/13

* Reverted request caching--no real benefit

## v0.1.2 11/6/13

* `getTrailheadAsGeoJSON()` returns trailheads as GeoJSON `Feature`s
* `getTripAsGeoJSON()` returns attributes in `properties`
* Naïve request caching (10MB limit, no support for ETags or
  If-Modified-Since)--primarily intended for command-line use

## v0.1.1 10/29/13

* `getTripAsGeoJSON()` returns trips as GeoJSON `Feature`s
* Transit&Trails ids are exposed as a top-level `Feature` property

## v0.1.0 9/11/13

* Initial version
