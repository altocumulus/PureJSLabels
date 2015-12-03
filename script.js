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
        return points.map(function (p) {
            return {x: p.x - dx, y: p.y - dy, l: p.l}
        });
    }

    function project(points) {
        var pts = translate(points, w2, h2);
        pts = pts.map(function (p) {
            var m = p.y / p.x,
                x = p.y >= 0 ? h2 / m : -h2 / m,
                y = p.x >= 0 ? w2 * m : -w2 * m;

            if (Math.abs(x) > w2) {
                return x >= 0 ? {x: w2, y: y} : {x: -w2, y: y};
            } else {
                return y >= 0 ? {x: x, y: h2} : {x: x, y: -h2};
            }
        });
        return linearize(translate(pts, -w2, -h2));
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
            line.setAttribute("stroke", "hsl(0,100%," + (points[i].l/(2*(width+height)))*100 + "%)");
            svg.appendChild(line);
        }
    }

    function tick() {

    }

    init();
    projected = project(markings);
    drawMarks(markings);
    drawLines(markings, projected);

    tick();
};