function SpriteLocator(config) {
    this.config = config;
}

SpriteLocator.prototype.locateSpriteAt = function(x, y) {
    var top = y, bottom = y, left = x, right = x,
        imageData = this.config.imageData,
        changed;

    if (!this._isXYFilled(x, y)) {
        return;
    }

    do {
        changed = false;
        while (top >= 0 && !this._isEdgeClear('x', top, left, right)) {
            top--;
            changed = true;
        }
        while (left >= 0 && !this._isEdgeClear('y', left, top, bottom)) {
            left--;
            changed = true;
        }
        while (bottom <= imageData.height && !this._isEdgeClear('x', bottom, left, right)) {
            bottom++;
            changed = true;
        }
        while (right <= imageData.width && !this._isEdgeClear('y', right, top, bottom)) {
            right++;
            changed = true;
        }
    } while (changed);

    return {top: top + 1, left: left + 1, bottom: bottom - 1, right: right - 1};
};

SpriteLocator.prototype._isEdgeClear = function(edgeDir, edgeStatic, edgeStart, edgeEnd) {
    var edgeDynamic;

    for (edgeDynamic = edgeStart; edgeDynamic <= edgeEnd; edgeDynamic++) {
        if ((edgeDir === 'x' && this._isXYFilled(edgeDynamic, edgeStatic)) || (edgeDir === 'y' && this._isXYFilled(edgeStatic, edgeDynamic))) {
            return false;
        }
    }

    return true;
};

SpriteLocator.prototype._isXYFilled = function(x, y) {
    var pixel = this._getPixelAt(x, y),
        backgroundRGB = this.config.backgroundRGB || {r: 0, g: 0, b: 0};

    return pixel.r !== backgroundRGB.r || pixel.g !== backgroundRGB.g || pixel.b !== backgroundRGB.b;
};

SpriteLocator.prototype._getPixelAt = function(x, y) {
    var imageData = this.config.imageData,
        index = (y * imageData.width + x) * 4;

    return {
        r: imageData.data[index],
        g: imageData.data[index+1],
        b: imageData.data[index+2],
        a: imageData.data[index+3],
    };
};

SpriteLocator.prototype.setBackground = function(rgb) {
    this.config.backgroundRGB = rgb;
};