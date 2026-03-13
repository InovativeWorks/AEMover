// AE Mover — ExtendScript (ES3)
// Minimal host script. Main logic runs in CEP Node.js environment.

function getAEVersion() {
    try {
        var result = {};
        result.version = app.version;
        result.buildName = app.buildName;
        return serializeResult(result);
    } catch (e) {
        return serializeResult({ error: e.toString() });
    }
}

function serializeResult(obj) {
    var pairs = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var val = obj[key];
            if (typeof val === "string") {
                val = '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
            } else if (val === null || val === undefined) {
                val = 'null';
            }
            pairs.push('"' + key + '":' + val);
        }
    }
    return '{' + pairs.join(',') + '}';
}
