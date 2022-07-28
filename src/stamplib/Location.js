export default {
    fly_to: function (earth, guid, lon, lat, alt) {
        var layer = earth.LayerManager.GetLayerByGUID(guid);
        if (layer != undefined) {
            earth.application.observer.flyTo({
                destination: StampGis.Cartesian3.fromRadians((layer.bound.west + layer.bound.east) / 2, (layer.bound.south + layer.bound.north) / 2, alt),
                orientation: {
                    heading: StampGis.StampMath.toRadians(0),
                    pitch: StampGis.StampMath.toRadians(-90),
                    roll: 0.0
                }
            });
        } else {
            earth.application.observer.flyTo({
                destination: StampGis.Cartesian3.fromDegrees(lon, lat, alt),
                orientation: {
                    heading: StampGis.StampMath.toRadians(0),
                    pitch: StampGis.StampMath.toRadians(-90),
                    roll: 0.0
                }
            });
        }
    },
    FlyTo: function (earth, lon, lat, alt, heading, pitch, roll) {
        earth.application.observer.flyTo({
            destination: StampGis.Cartesian3.fromDegrees(lon, lat, alt),
            orientation: {
                heading: StampGis.StampMath.toRadians(heading),
                pitch: StampGis.StampMath.toRadians(pitch),
                roll: roll
            }
        });
    },
    flyToRadians: function (earth, lon, lat, alt, heading, pitch, roll) {
        earth.application.observer.flyTo({
            destination: StampGis.Cartesian3.fromRadians(lon, lat, alt),
            orientation: {
                heading: StampGis.StampMath.toRadians(heading),
                pitch: StampGis.StampMath.toRadians(pitch),
                roll: roll
            }
        });
    },
    FlyToLayer: function (earth, guid, alt) {
        var layer = earth.LayerManager.GetLayerByGUID(guid);
        var rectNorth = layer.bound.north;
        var rectSouth = layer.bound.south;
        var rectEast = layer.bound.east;
        var rectWest = layer.bound.west;

        var centerX = (rectEast + rectWest) / 2;
        var centerY = (rectNorth + rectSouth) / 2;
        var width = (parseFloat(rectNorth) - parseFloat(rectSouth)) / 2;
        var rangeWidth = width * 6378137 / Math.tan(22.5 / 180 * Math.PI);

        var height = (parseFloat(rectEast) - parseFloat(rectWest)) / 2;
        var rangeHeight = height * 6378137 / Math.tan(22.5 / 180 * Math.PI);

        var range = Math.max(rangeWidth, rangeHeight);
        if (layer != undefined) {
            earth.application.observer.flyTo({
                destination: StampGis.Cartesian3.fromRadians(centerX, centerY, layer.bound.maxHeight + range),
                orientation: {
                    heading: StampGis.StampMath.toRadians(0),
                    pitch: StampGis.StampMath.toRadians(-90),
                    roll: 0.0
                }
            });
        }
    },
    flyToPoints: function (earth, points) {
        var lonlat = {
            North: 0,
            South: 0,
            East: 0,
            West: 0
        };
        for (var i = 0; i < points.length; i++) {
            lonlat.North = lonlat.North == 0 ? points[i].y : Math.max(lonlat.North, points[i].y);
            lonlat.South = lonlat.South == 0 ? points[i].y : Math.min(lonlat.South, points[i].y);
            lonlat.East = lonlat.East == 0 ? points[i].x : Math.max(lonlat.East, points[i].x);
            lonlat.West = lonlat.West == 0 ? points[i].x : Math.min(lonlat.West, points[i].x);
        }

        var rectNorth = lonlatBox.North;
        var rectSouth = lonlatBox.South;
        var rectEast = lonlatBox.East;
        var rectWest = lonlatBox.West;

        var centerX = (rectEast + rectWest) / 2;
        var centerY = (rectNorth + rectSouth) / 2;
        earth.application.observer.flyTo({
            destination: StampGis.Cartesian3.fromRadians(centerX, centerY, 50),
            orientation: {
                heading: StampGis.StampMath.toRadians(0),
                pitch: StampGis.StampMath.toRadians(-90),
                roll: 0.0
            }
        });
    },
    flyToLonLat: function (earth, lonlatBox) {
        var rectNorth = lonlatBox.North;
        var rectSouth = lonlatBox.South;
        var rectEast = lonlatBox.East;
        var rectWest = lonlatBox.West;

        var centerX = (rectEast + rectWest) / 2;
        var centerY = (rectNorth + rectSouth) / 2;
        var width = (parseFloat(rectNorth) - parseFloat(rectSouth)) / 2;
        var rangeWidth = width * 6378137 / Math.tan(22.5 / 180 * Math.PI);

        var height = (parseFloat(rectEast) - parseFloat(rectWest)) / 2;
        var rangeHeight = height * 6378137 / Math.tan(22.5 / 180 * Math.PI);

        var range = Math.max(rangeWidth, rangeHeight, 30);
        earth.application.observer.flyTo({
            destination: StampGis.Cartesian3.fromRadians(centerX, centerY, range),
            orientation: {
                heading: StampGis.StampMath.toRadians(0),
                pitch: StampGis.StampMath.toRadians(-90),
                roll: 0.0
            }
        });
    },
    goToLonLat: function (earth, lonlatBox) {
        var rectNorth = lonlatBox.North;
        var rectSouth = lonlatBox.South;
        var rectEast = lonlatBox.East;
        var rectWest = lonlatBox.West;

        var centerX = (rectEast + rectWest) / 2;
        var centerY = (rectNorth + rectSouth) / 2;
        var width = (parseFloat(rectNorth) - parseFloat(rectSouth)) / 2;
        var rangeWidth = width * 6378137 / Math.tan(22.5 / 180 * Math.PI);

        var height = (parseFloat(rectEast) - parseFloat(rectWest)) / 2;
        var rangeHeight = height * 6378137 / Math.tan(22.5 / 180 * Math.PI);

        var range = Math.max(rangeWidth, rangeHeight) + 50;//加20米保证视角在偏中心位置点
        earth.application.observer.setView({
            destination: StampGis.Cartesian3.fromRadians(centerX, centerY, range),
            orientation: {
                heading: StampGis.StampMath.toRadians(0),
                pitch: StampGis.StampMath.toRadians(-90),
                roll: 0.0
            }
        });
    },
    flyToBound: function (earth, lonlatBox, locationHeight) {
        var rectNorth = lonlatBox.north;
        var rectSouth = lonlatBox.south;
        var rectEast = lonlatBox.east;
        var rectWest = lonlatBox.west;

        var centerX = (rectEast + rectWest) / 2;
        var centerY = (rectNorth + rectSouth) / 2;
        var width = (parseFloat(rectNorth) - parseFloat(rectSouth)) / 2;
        var rangeWidth = width * 6378137 / Math.tan(22.5 / 180 * Math.PI);

        var height = (parseFloat(rectEast) - parseFloat(rectWest)) / 2;
        var rangeHeight = height * 6378137 / Math.tan(22.5 / 180 * Math.PI);

        var range = Math.max(rangeWidth, rangeHeight, 30);
        earth.application.observer.flyTo({
            destination: StampGis.Cartesian3.fromRadians(centerX, centerY, locationHeight ? locationHeight : range),
            orientation: {
                heading: StampGis.StampMath.toRadians(0),
                pitch: StampGis.StampMath.toRadians(-90),
                roll: 0.0
            }
        });
    },
}