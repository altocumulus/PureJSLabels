window.onload = function () {
    const NUMBER_MARKINGS = 100,
        NS_SVG = "http://www.w3.org/2000/svg";

    var svg = document.getElementById("acgraphic"),
        width = +svg.getAttribute("width"),
        w2 = width / 2,
        height = +svg.getAttribute("height"),
        h2 = height / 2,

        markings = [],
        projected;

    function getRandomPoint() {
        return {x: Math.random() * width, y: Math.random() * height};
    }

    function translate(points, dx, dy) {
        points.forEach(function (p) {
            p.x -= dx;
            p.y -= dy;
        });
    }

    function project(points) {
        var pts = points.map(function (p) {
            var point = {x: +p.x, y: +p.y, m: p};
            p.p = point;
            return point;
        });

        translate(pts, w2, h2);
        pts.forEach(function (p) {
            var m = p.y / p.x,
                x = p.y >= 0 ? h2 / m : -h2 / m,
                y = p.x >= 0 ? w2 * m : -w2 * m;

            if (Math.abs(x) > w2) {
                p.x = x >= 0 ? w2 : -w2;
                p.y = y;
            } else {
                p.x = x;
                p.y = y >= 0 ? h2 : -h2;
            }
        });

        console.log(pts);
        translate(pts, -w2, -h2);
        return linearize(pts);
    }

    function linearize(points) {
        points.forEach(function (p) {
            if (p.y == 0) {
                p.l = p.x;
            } else if (p.y < height) {
                p.l = p.x == 0 ? 2 * (width + height) - p.y : width + p.y;
            } else {
                p.l = 2 * width + height - p.x;
            }
        });
        return points;
    }

    function delinearize(points) {
        points.forEach(function (p) {
            if (p.l < width) {
                p.x = p.l;
                p.y = 0;
            } else if (p.l < width + height) {
                p.x = width;
                p.y = p.l - width;
            } else if (p.l < 2 * width + height) {
                p.x = p.l - width - height;
                p.y = height;
            } else {
                p.x = 0;
                p.y = p.l - (2 * width + height);
            }
        });
        return points;
    }

    function init() {
        var i;
        for (i = 0; i < NUMBER_MARKINGS; i++) {
            markings.push(getRandomPoint());
        }
    }

    function drawMarks(marks) {
        var i,
            circle;
        for (i = 0; i < marks.length; i++) {
            circle = document.createElementNS(NS_SVG, "circle");
            circle.setAttribute("cx", marks[i].x);
            circle.setAttribute("cy", marks[i].y);
            circle.setAttribute("r", "2");
            svg.appendChild(circle);
        }
    }

    function drawLines(marks, points) {
        var i,
            line;
        for (i = 0; i < points.length; i++) {
            line = document.createElementNS(NS_SVG, "line");
            line.setAttribute("x1", marks[i].x);
            line.setAttribute("y1", marks[i].y);
            line.setAttribute("x2", points[i].x);
            line.setAttribute("y2", points[i].y);
            line.setAttribute("stroke", "hsl(0,100%," + (points[i].l / (2 * (width + height))) * 100 + "%)");
            svg.appendChild(line);
        }
    }

    var alpha = 0.99;

    function tick() {

    }

    init();
    projected = project(markings);
    drawMarks(markings);
    drawLines(markings, projected);

    while (alpha > 0.01) {
        alpha *= alpha;
        tick();
    }
}
;