var c = document.getElementById("bgCanvas");
var ctx = c.getContext("2d");



BGC = {
    points: [],
    init: function() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        for (var i = 0; i < 40; i++) {
            BGC.add();
        }
    },
    add: function() {
        BGC.points.push({
            x: Math.random() * window.innerWidth * 2 - window.innerWidth/2,
            y: Math.random() * window.innerHeight * 2 - window.innerHeight/2,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1
        });
    },
    remove: function() {
        BGC.points.splice(1, 1);
    },
    draw: function() {
        var numOfPoints = BGC.points.length;

        ctx.fillStyle = "rgba(255,255,255, .9)";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        for (var i = 0; i < numOfPoints; i++) {
            var pt = BGC.points[i];
            pt.vx += (Math.random() - .5) / 4;
            pt.vy += (Math.random() - .5) / 4;
            pt.vx = clampNum(-1, pt.vx, 1);
            pt.vy = clampNum(-1, pt.vy, 1);
            pt.x += pt.vx;
            pt.y += pt.vy;
            var min = window.innerHeight * (-.3);
            var max = window.innerHeight * (1.3);
            if (Math.abs(pt.x - (window.innerWidth / 2)) > window.innerWidth / 1.8) {
                pt.vx -= .5 * pt.x / Math.abs(pt.x);
            }
            if (Math.abs(pt.y - (window.innerHeight / 2)) > window.innerHeight / 1.8) {
                pt.vy -= .5 * pt.y / Math.abs(pt.y);
            }
            //ctx.fillStyle = "#FFFFFF";
            //ctx.fillRect(pt.x, pt.y, 1, 1);
        }

        for (var i = 0; i < numOfPoints; i++) {
            var p1 = BGC.points[i];
            var cF = 6;
            for (var ii = i + 1; ii < numOfPoints; ii++) {
                var p2 = BGC.points[ii];
                var d = BGC.dist(p1, p2);
                if (d < window.innerWidth / cF) {

                    xDiff = p1.x - p2.x;
                    yDiff = p1.y - p2.y;

                    p1.vx += Math.pow(window.innerWidth / cF - Math.abs(xDiff), 2)/1000000 * xDiff / Math.abs(xDiff);
                    p2.vx -= Math.pow(window.innerWidth / cF - Math.abs(xDiff), 2)/1000000 * xDiff / Math.abs(xDiff);
                    p1.vy += Math.pow(window.innerWidth / cF - Math.abs(yDiff), 2)/1000000 * yDiff / Math.abs(yDiff);
                    p2.vy -= Math.pow(window.innerWidth / cF - Math.abs(yDiff), 2)/1000000 * yDiff / Math.abs(yDiff);

                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    var alpha = 20*((window.innerWidth / cF) - d) / (window.innerWidth / cF);
                    ctx.strokeStyle = "rgba(150,150,150," + alpha + ")";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    },
    dist: function(p1, p2) {
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    }
}

BGC.init();

BGC.interv = setInterval(BGC.draw, 60);
