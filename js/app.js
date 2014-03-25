(function(){
    var loadImageInput  = document.getElementById('load-image'),
        canvasNode      = document.getElementById('canvas'),
        spriteNode      = document.getElementById('sprite'),
        backgroundNode  = document.getElementById('background-rgb'),
        reloadButton    = document.getElementById('reload-button'),
        spriteInfo      = document.getElementById('sprite-info'),
        highlighted     = {},
        currentEdges,
        imageFile,
        backgroundRGB,
        spriteLocator;

    function handleLoadImage(e) {
        var file = e.target.files[0];
        if (file) {
            imageFile = file;
            loadImage(file);
        }
    }

    function loadImage(file) {
        var Url = URL || webkitURL,
            src = Url.createObjectURL(file),
            img = new Image();

        img.onload = function() {
            drawImage(img);
            Url.revokeObjectURL(src);
        };
        img.src = src;
    }

    function drawImage(img) {
        var height          = img.height,
            width           = img.width,
            canvasContext   = canvasNode.getContext('2d'),
            majorityRGB;

        canvasNode.height = height;
        canvasNode.width = width;
        canvasContext.drawImage(img, 0, 0);

        spriteLocator = null;
        highlighted = {};

        backgroundRGB = getMajorityRGB(getImageData(0, 0, height, width));
        backgroundNode.value = 'rgb('+backgroundRGB.r+','+backgroundRGB.g+','+backgroundRGB.b+')';
    }

    function getMajorityRGB(imageData) {
        var width   = imageData.width,
            height  = imageData.height,
            stats   = {},
            x, y, pixel, rgb, mostRgb;

        for (x = 0; x <= width; x++) {
            for (y = 0; y <= height; y++) {
                pixel = getPixelAt(imageData, x, y);
                rgb = pixel.r+','+pixel.g+','+pixel.b;
                if (stats[rgb]) {
                    stats[rgb]++;
                } else {
                    stats[rgb] = 1;
                }
            }
        }

        for (rgb in stats) {
            if (!mostRgb || stats[rgb] > stats[mostRgb]) {
                mostRgb = rgb;
            }
        }

        mostRgb = mostRgb.split(',');

        return {r: parseInt(mostRgb[0]), g: parseInt(mostRgb[1]), b: parseInt(mostRgb[2])};
    }

    loadImageInput.addEventListener('change', handleLoadImage);

    function handleImageClick(e) {
        var x = e.offsetX,
            y = e.offsetY,
            imageData,
            pixel,
            edges;

        if (backgroundNode.value === '') {
            imageData = getImageData(0, 0, canvasNode.height, canvasNode.width);
            pixel = getPixelAt(imageData, x, y);
            backgroundNode.value = 'rgb(' + pixel.r + ',' + pixel.g + ',' + pixel.b +')';
            backgroundRGB = pixel;
        } else {
            edges = locateSprite(x, y);
            if (edges) {
                if (currentEdges && (e.ctrlKey || e.metaKey)) {
                    edges = mergeEdges(edges, currentEdges);
                }
                restoreHighlighted();
                imageData = getImageData(edges.top, edges.left, edges.bottom, edges.right);
                highlightArea(edges.top, edges.left, edges.bottom, edges.right);
                spriteNode.width = edges.right - edges.left + 1;
                spriteNode.height = edges.bottom - edges.top + 1;
                spriteNode.getContext('2d').putImageData(imageData, 0, 0);
                spriteInfo.value = 'top=' + edges.top + ' left=' + edges.left + ' bottom=' + edges.bottom + ' right=' + edges.right +
                    ' width=' + (edges.right - edges.left + 1) + ' height=' + (edges.bottom - edges.top + 1);
                currentEdges = edges;
            } else if (!(e.ctrlKey || e.metaKey)) {
                restoreHighlighted();
                spriteNode.width = 0;
                spriteNode.height = 0;
                spriteInfo.value = '';
                currentEdges = undefined;
            }
        }
    }

    function locateSprite(x, y) {
        var edges,
            background;

        if (!spriteLocator) {
            spriteLocator = new SpriteLocator({
                imageData: getImageData(0, 0, canvasNode.height, canvasNode.width)
            });
        }

        spriteLocator.setBackground(backgroundRGB);

        return spriteLocator.locateSpriteAt(x, y);
    }

    function highlightArea(top, left, bottom, right) {
        var canvasContext = canvasNode.getContext('2d');

        saveHighlighted(top, left, bottom, right);
        canvasContext.setFillColor(0, 1, 0, 0.5);
        canvasContext.fillRect(left, top, right - left + 1, bottom - top + 1);
    }

    function saveHighlighted(top, left, bottom, right) {
        highlighted.imageData = getImageData(top, left, bottom, right);
        highlighted.top     = top;
        highlighted.left    = left;
    }

    function restoreHighlighted() {
        if (!highlighted.imageData) {
            return;
        }
        canvasNode.getContext('2d').putImageData(highlighted.imageData, highlighted.left, highlighted.top);
    }

    function getImageData(top, left, bottom, right) {
        return canvasNode.getContext('2d').getImageData(left, top, right - left + 1, bottom - top + 1);
    }

    function mergeEdges(e1, e2) {
        return {
            top     : e1.top    < e2.top    ? e1.top    : e2.top,
            bottom  : e1.bottom > e2.bottom ? e1.bottom : e2.bottom,
            left    : e1.left   < e2.left   ? e1.left   : e2.left,
            right   : e1.right  > e2.right  ? e1.right  : e2.right
        };
    }

    function getPixelAt(imageData, x, y) {
        var index = (y * imageData.width + x) * 4;

        return {
            r: imageData.data[index],
            g: imageData.data[index+1],
            b: imageData.data[index+2],
            a: imageData.data[index+3],
        };
    }

    canvasNode.addEventListener('click', handleImageClick);

    function handleReloadButton() {
        if (imageFile) {
            loadImage(imageFile);
        }
    }

    reloadButton.addEventListener('click', handleReloadButton);
})();