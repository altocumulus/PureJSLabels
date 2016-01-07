window.onload = function () {

    const NUMBER_MARKINGS = 30,
        NS_SVG = "http://www.w3.org/2000/svg";

    var svg = document.getElementById("acgraphic"),
        viewbox = svg.viewBox.animVal,
        width = viewbox.width, //+svg.getAttribute("width"),
        w2 = width / 2,
        height = viewbox.height, //+svg.getAttribute("height"),
        h2 = height / 2,
        w2h2 = 2 * (width + height),

        markings = [],
        projected = [],

        alpha = 0.999;

    function getRandomPoint(n) {
        return {x: normalRandom() * width + 1.5 * w2, y: normalRandom() * height + 1.5 * h2, n: n};
        //return {x: Math.random() * width, y: Math.random() * height};
    }

    function translate(points, dx, dy) {
        points.forEach(function (p) {
            p.x -= dx;
            p.y -= dy;
        });
    }

    function project(points) {
        var pts = points.map(function (p) {
            var point = {x: p.x, y: p.y, m: p, l: 0, f: 0};
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

        translate(pts, -w2, -h2);
        return linearize(pts);
    }

    function linearize(points) {
        points.forEach(function (p) {
            if (p.y == 0) {
                p.l = p.x;
            } else if (p.y < height) {
                p.l = p.x == 0 ? w2h2 - p.y : width + p.y;
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
                p.x = -p.l + 2 * width + height;
                p.y = height;
            } else {
                p.x = 0;
                p.y = -p.l + w2h2;
            }
        });
        return points;
    }

    function init() {
        var i;
        for (i = 0; i < NUMBER_MARKINGS; i++) {
            markings.push(getRandomPoint(i));
        }

        projected = project(markings);
        drawMarks(markings);
        drawLines(markings);
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

    function drawLines(marks) {
        var i;
        for (i = 0; i < marks.length; i++) {
            marks[i].line = document.createElementNS(NS_SVG, "line");
            svg.appendChild(marks[i].line);
        }
    }

    function updateLines(marks) {
        var i,
            line;
        for (i = 0; i < marks.length; i++) {
            line = marks[i].line;
            line.setAttribute("x1", marks[i].x);
            line.setAttribute("y1", marks[i].y);
            line.setAttribute("x2", marks[i].p.x);
            line.setAttribute("y2", marks[i].p.y);
            //line.setAttribute("stroke", "hsl(0,100%," + (marks[i].p.l / (w2h2)) * 100 + "%)");
        }
    }

    init();

    function tick() {

        var i,
            j,
            o,
            p,
            d,
            f,
            n = projected.length;

        for (i = 0; i < n; i++) {
            p = projected[i];
            d = 0;
            j = i;
            while (d < 250) {
                o = projected[++j % n];
                d = o.l - p.l;
                d = d > 0 ? d : d + w2h2;
                f = Math.min(5, 20 * alpha / Math.pow(d ? d : 1, 0.5));
                p.f -= f;
                o.f += f;
            }
        }

        for (i = 0; i < n; i++) {
            p = projected[i];
            p.l += p.f;
            p.f = 0;
        }
    }

    document.querySelector("body")
        .addEventListener("click", function () {
            alpha *= .995;
            projected.sort(lComparator);
            tick();
            delinearize(projected);
            updateLines(markings);
        });

    function lComparator(pa, pb) {
        return pa.l - pb.l;
    }

    while (alpha > 0.01) {
        alpha *= 0.995;
        projected.sort(lComparator);
        tick();
        delinearize(projected);
        updateLines(markings);
    }

    var padding = { left: 50, top: 50, right: 50, bottom: 100},
        W = 960,
        H = W / (width / height);
    padding.bottom = H - padding.top - (W - padding.left - padding.right) / (width / height);
    var outerSvg = document.createElementNS(NS_SVG, "svg");
    outerSvg.setAttribute("width", W);
    outerSvg.setAttribute("height", H);

    var g = document.createElementNS(NS_SVG, "g");
    g.setAttribute("transform", "translate(" + padding.left + " " + padding.top + ")");
    outerSvg.appendChild(g);

    var borderRect = document.createElementNS(NS_SVG, "rect");
    borderRect.setAttribute("x", "-1");
    borderRect.setAttribute("y", "-1");
    borderRect.setAttribute("width", (W - padding.left - padding.right + 2));
    borderRect.setAttribute("height", (H - padding.top - padding.bottom + 2));
    borderRect.setAttribute("stroke", "black");
    borderRect.setAttribute("fill", "none");
    g.appendChild(borderRect);

    svg.setAttribute("width", (W - padding.left - padding.right).toString());
    svg.setAttribute("height", (H - padding.top - padding.bottom));

    var body = document.getElementsByTagName("body").item(0);
    body.appendChild(outerSvg);
    g.appendChild(body.removeChild(svg));
};

spareRandom = null;
function normalRandom() {
    var val, u, v, s, mul;

    if (spareRandom !== null) {
        val = spareRandom;
        spareRandom = null;
    }
    else {
        do
        {
            u = Math.random() * 2 - 1;
            v = Math.random() * 2 - 1;

            s = u * u + v * v;
        } while (s === 0 || s >= 1);

        mul = Math.sqrt(-2 * Math.log(s) / s);

        val = u * mul;
        spareRandom = v * mul;
    }

    return val / 14;	// 7 standard deviations on either side
}
